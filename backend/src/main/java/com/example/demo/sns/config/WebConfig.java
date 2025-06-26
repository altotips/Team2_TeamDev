package com.example.demo.sns.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@CrossOrigin
@Configuration
public class WebConfig implements WebMvcConfigurer {
	@Value("${upload.path}")
	private String uploadPath;

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry
				.addResourceHandler("/uploads/**")
				.addResourceLocations("file:" + uploadPath + "/");
	}
}
