package in.neuarc.loom.config;

import in.neuarc.loom.entity.User;
import in.neuarc.loom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserRepository userRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/static/**", "/api-docs/**", "/swagger-ui/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler((request, response, authentication) -> {
                    OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
                    String email = oAuth2User.getAttribute("email");
                    String name = oAuth2User.getAttribute("name");
                    String picture = oAuth2User.getAttribute("picture");

                    userRepository.findByEmail(email).orElseGet(() -> {
                        User newUser = User.builder()
                                .email(email)
                                .name(name)
                                .picture(picture)
                                .build();
                        return userRepository.save(newUser);
                    });

                    response.sendRedirect("http://localhost:5173/"); // Redirect to React frontend
                })
            )
            .logout(logout -> logout.logoutSuccessUrl("/"));

        return http.build();
    }
}
