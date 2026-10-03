// package com.instragram.project.configuration;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.context.MessageSource;
// import org.springframework.context.support.ResourceBundleMessageSource;
// import org.springframework.web.servlet.LocaleResolver;
// import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;
// import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
// import java.util.List;

// import java.util.Locale;

// /**
//  * Configuration class for setting up locale resolution and message source.
//  */
// @Configuration
// public class LocaleConfig {

//     @Bean
//     public MessageSource messageSource() {
//         ResourceBundleMessageSource source = new ResourceBundleMessageSource();
//         source.setBasenames("localization/messages"); // resources/localization/messages[_fr].properties
//         source.setDefaultEncoding("UTF-8");
//         source.setFallbackToSystemLocale(false); // an unknown locale falls back to messages.properties (English), not the server's locale
//         source.setUseCodeAsDefaultMessage(true); // if a key is missing, show the key instead of throwing
//         return source;
//     }

//     @Bean
//     public LocaleResolver localeResolver() {
//         AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
//         resolver.setDefaultLocale(Locale.ENGLISH);
//         resolver.setSupportedLocales(List.of(Locale.ENGLISH, Locale.FRENCH));
//         return resolver;
//     }

//     // Points Bean Validation's {key} message interpolation at the same messages.properties /
//     // messages_fr.properties bundle GlobalExceptionHandler already uses,
//     // instead of Hibernate
//     // Validator's own ValidationMessages.properties. Without this, @NotBlank(message = "{plan.name.required}")
//     // would just render the literal key text.
//     @Bean
//     public LocalValidatorFactoryBean validator(MessageSource messageSource) {
//         LocalValidatorFactoryBean bean = new LocalValidatorFactoryBean();
//         bean.setValidationMessageSource(messageSource);
//         return bean;
//     }
// }