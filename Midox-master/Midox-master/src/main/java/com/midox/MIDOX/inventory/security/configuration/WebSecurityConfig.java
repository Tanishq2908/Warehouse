package com.midox.MIDOX.inventory.security.configuration;

import com.midox.MIDOX.inventory.security.authentication.JwtAuthenticationEntryPoint;
import com.midox.MIDOX.inventory.security.authentication.JwtRequestFilter;
import com.midox.MIDOX.inventory.service.spi.IEmployeeCredentialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Collection;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig{

    @Autowired
    private JwtAuthenticationEntryPoint point;
    @Autowired
    private JwtRequestFilter filter;

    @Value("${enable.authentication}")
    private boolean authenticationEnabled;
/*
    @Autowired
    private PasswordEncoder passwordEncoder;*/

    @Autowired
    private IEmployeeCredentialService credentialService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

            //http.cors();
            http.cors().and().csrf(csrf -> csrf.disable());
            if(authenticationEnabled){
                http.authorizeHttpRequests(auth -> auth
                        .requestMatchers("/authenticate").permitAll()//requestMatchers("/login").permitAll()
                        .anyRequest()
                        .authenticated());

            }else{
                http.authorizeHttpRequests(auth -> auth
                        //.requestMatchers("/authenticate").permitAll()//requestMatchers("/login").permitAll()
                        .anyRequest()
                        .permitAll());
            }

            http.exceptionHandling(ex -> ex.authenticationEntryPoint(point))
                    .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
            http.addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);
            return http.build();

    }
/*

    @Bean
    public DaoAuthenticationProvider doDaoAuthenticationProvider(){
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(credentialService);
        daoAuthenticationProvider.setPasswordEncoder(new BCryptPasswordEncoder());
        return daoAuthenticationProvider;
    }
*/

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            //TODO need to revisit this once authentication is applied.
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**").allowedOrigins("*").allowedMethods("GET", "POST","PUT", "DELETE");
            }
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration builder) throws Exception {
        return builder.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

   /* @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .authorizeHttpRequests(registry -> registry
                        .requestMatchers("/secured/**").hasRole("SYS_ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2Configurer -> oauth2Configurer.jwt(jwtConfigurer -> jwtConfigurer.jwtAuthenticationConverter(jwt -> {
                    Map<String, Collection<String>> realmAccess = jwt.getClaim("realm_access");
                    Collection<String> roles = realmAccess.get("roles");
                    var grantedAuthorities = roles.stream()
                            .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                            .toList();
                    return new JwtAuthenticationToken(jwt, grantedAuthorities);
                })))
        ;

        return httpSecurity.build();
    }*/
}