package com.example.demo.sns.controller;

import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/*
 * ユーザのリクエストオブジェクト
 * (ユーザ名またはユーザIDを同じ変数に入れてコントローラで分岐させている)
*/
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsersRequest {
	@Id
	private Long id;

//	ユーザ名またはメールアドレスを入れる変数
	@NotBlank
	private String UserNameOrMailAddress;

	@NotBlank
	private String password;
}