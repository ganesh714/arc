package in.neuarc.loom.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIService {

    // private final OpenAiChatModel chatModel; // Commented out until API key is provided

    public String generateCode(String diagramJson, String targetFramework) {
        log.info("Generating {} code for diagram...", targetFramework);
        
        // This is where the magic happens. 
        // We will construct a prompt with the diagram data and ask the AI to generate code.
        
        String prompt = String.format(
            "Convert the following diagram JSON to a responsive %s component:\n%s",
            targetFramework, diagramJson
        );

        // For now, returning a stub. In the next phase, we'll implement actual prompt engineering.
        return String.format("/* Generated %s code for diagram */\nexport const GeneratedComponent = () => { return <div>Generated Content</div> };", targetFramework);
    }
}
