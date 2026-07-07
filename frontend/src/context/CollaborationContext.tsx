import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

export interface RemoteCursor {
  x: number;
  y: number;
  name: string;
  lastUpdated: number;
}

export interface SyncMessage {
  type: string;
  fileId: string;
  senderId: string;
  senderName: string;
  payload: any;
}

interface CollaborationContextType {
  broadcast: (type: string, payload: any) => void;
  remoteCursors: Record<string, RemoteCursor>;
  isConnected: boolean;
  connectToFile: (fileId: string) => void;
  incomingActions: SyncMessage[];
  clearIncomingActions: () => void;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isGuest } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({});
  const [incomingActions, setIncomingActions] = useState<SyncMessage[]>([]);
  
  const clientRef = useRef<Client | null>(null);

  const connectToFile = useCallback((fileId: string) => {
    setActiveFileId(fileId);
  }, []);

  useEffect(() => {
    if (isGuest || !activeFileId || !user) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setIsConnected(false);
      setRemoteCursors({});
      return;
    }

    const arcApiUrl = (import.meta.env.VITE_ARC_API_URL || 'http://localhost:8081').replace(/\/$/, '');
    
    const client = new Client({
      webSocketFactory: () => new SockJS(`${arcApiUrl}/ws`, null, {
        withCredentials: true
      } as any),
      connectHeaders: {
        // Handled by our backend interceptor via cookies, but we could add auth headers here
      },
      debug: () => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);

      client.subscribe(`/topic/files/${activeFileId}`, (message) => {
        if (!message.body) return;

        let syncMsg: SyncMessage | null = null;

        try {
          // quick defensive size check (avoid parsing huge payloads)
          if (typeof message.body === 'string' && message.body.length > 200_000) {
            console.warn('[Collaboration] Dropping oversized message');
            return;
          }

          const parsed = JSON.parse(message.body);

          if (!parsed || typeof parsed !== 'object') {
            console.warn('[Collaboration] Ignoring non-object message');
            return;
          }

          const { type, fileId: msgFileId, senderId, senderName, payload } = parsed as any;

          if (typeof type !== 'string' || typeof msgFileId !== 'string' || typeof senderId !== 'string') {
            console.warn('[Collaboration] Ignoring malformed message', parsed);
            return;
          }

          // ignore messages intended for other files
          if (msgFileId !== activeFileId) return;

          syncMsg = {
            type,
            fileId: msgFileId,
            senderId,
            senderName: senderName || 'Unknown',
            payload
          };
        } catch (e) {
          console.warn('[Collaboration] Failed to parse incoming message', e);
          return;
        }

        if (!syncMsg) return;
        if (syncMsg.senderId === user.id) return; // Ignore own messages

        if (syncMsg.type === 'CURSOR_MOVED') {
          setRemoteCursors(prev => ({
            ...prev,
            [syncMsg!.senderId]: {
              x: syncMsg!.payload.x,
              y: syncMsg!.payload.y,
              name: syncMsg!.senderName,
              lastUpdated: Date.now()
            }
          }));
        } else {
          setIncomingActions(prev => [...prev, syncMsg]);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.onWebSocketClose = () => {
      setIsConnected(false);
    };

    client.activate();
    clientRef.current = client;

    const cursorCleanupInterval = setInterval(() => {
      const now = Date.now();
      setRemoteCursors(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(id => {
          if (now - next[id].lastUpdated > 5000) {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 2000);

    return () => {
      clearInterval(cursorCleanupInterval);
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [activeFileId, user, isGuest]);

  const broadcast = useCallback((type: string, payload: any) => {
    if (clientRef.current && clientRef.current.connected && activeFileId && user) {
      const message: SyncMessage = {
        type,
        fileId: activeFileId,
        senderId: user.id,
        senderName: user.name || 'Anonymous',
        payload
      };
      
      clientRef.current.publish({
        destination: `/app/sync/${activeFileId}`,
        body: JSON.stringify(message)
      });
    }
  }, [activeFileId, user]);

  const clearIncomingActions = useCallback(() => {
    setIncomingActions([]);
  }, []);

  return (
    <CollaborationContext.Provider value={{ broadcast, remoteCursors, isConnected, connectToFile, incomingActions, clearIncomingActions }}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};
