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

	private String urlIcon;

	@NotBlank
	private String fullName;

	@NotBlank
	private String userName;

	@NotBlank
	private String email;

	@NotBlank
	private String password;

	@NotBlank
	private String salt;

	@Column(columnDefinition = "STRING DEFAULT ''")
	private String selfIntroduction;
	
	private Long authId;

	@Column(columnDefinition = "BOOLEAN DEFAULT 0")
	private Boolean delFlag;

}
