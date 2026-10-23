package com.midox.MIDOX;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class MidoxApplication extends SpringBootServletInitializer implements ApplicationContextAware {
    // TODO ApplicationContextAware  is added to support service invocation from static method. Need to figure a better approach for same.


    private static ApplicationContext appContext;

    public static void main(String[] args) {
        SpringApplication.run(MidoxApplication.class, args);
    }

   /* @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            //TODO need to revisit this once authentication is applied.
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**").allowedOrigins("*").allowedMethods("GET", "POST","PUT", "DELETE");
            }
        };
    }*/

    @Override
    public void setApplicationContext(ApplicationContext argApplicationContext) throws BeansException {
        appContext = argApplicationContext;
    }

    public static ApplicationContext getAppContext() {
        return appContext;
    }

}
