package com.example.demo.sns.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
public class Users {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(columnDefinition = "VARCHAR DEFAULT 'http://localhost:8080/uploads/default_icon.png'")
	private String urlIcon;

	@NotBlank
	private String fullName;

	@NotBlank
	@Column(unique = true)
	private String userName;

	@NotBlank
	@Column(unique = true)
	private String email;

	@NotBlank
	private String password;

	@NotBlank
	private String salt;

	@Column(columnDefinition = "VARCHAR DEFAULT ''")
	private String selfIntroduction = "";

	@Column(columnDefinition = "LONG DEFAULT 0")
	private Long authId = 0l;

	@Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
	private Boolean delFlag = false;

}
