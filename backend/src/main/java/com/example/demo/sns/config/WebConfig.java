package com.example.demo.sns.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

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

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**") // 全てのパスに対してCORSを設定
				.allowedOrigins("http://localhost:5173") // フロントエンドのURLを指定
				//				.allowedOrigins("http://192.168.137.1:5173") // フロントエンドのURLを指定
				// 開発中は一時的にすべてのオリジンを許可することも可能: .allowedOrigins("*")
				.allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // 許可するHTTPメソッド
				.allowedHeaders("*") // 許可するヘッダー
				.allowCredentials(true) // クッキーなどの資格情報を許可する場合
				.maxAge(3600); // プリフライトリクエストの結果をキャッシュする時間 (秒)
	}
}
