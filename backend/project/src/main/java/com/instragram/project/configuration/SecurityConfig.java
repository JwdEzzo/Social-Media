package com.instragram.project.configuration;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.instragram.project.security.jwt.JwtFilter;
import com.instragram.project.security.users.AppUserDetailsService;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

   @Autowired
   private AppUserDetailsService appUserDetailsService;

   @Autowired
   private JwtFilter jwtFilter;

   @Bean
   public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
      return http
            .csrf(customizer -> customizer.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(request -> request
                  .requestMatchers("/*")
                  .permitAll()
                  .anyRequest().permitAll())
            .httpBasic(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
   }

   @Bean
   public AuthenticationManager customAuthenticationManager() {
      return new ProviderManager(appUserAuthenticationProvider());
   }

   @SuppressWarnings("deprecation")
   @Bean
   public AuthenticationProvider appUserAuthenticationProvider() {
      DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
      provider.setPasswordEncoder(passwordEncoder());
      provider.setUserDetailsService(appUserDetailsService);
      return provider;
   }

   @Bean
   public CorsConfigurationSource corsConfigurationSource() {
      CorsConfiguration configuration = new CorsConfiguration();
      configuration.setAllowedOriginPatterns(Arrays.asList("*"));
      configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
      configuration.setAllowedHeaders(Arrays.asList("*"));
      configuration.setAllowCredentials(true);

      UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
      source.registerCorsConfiguration("/**", configuration);
      return source;
   }

   @Bean
   public BCryptPasswordEncoder passwordEncoder() {
      return new BCryptPasswordEncoder(12);
   }

}