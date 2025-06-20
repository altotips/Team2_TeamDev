package com.example.demo.sns.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Entity
@Data
@Table(name = "follows")
public class Follows {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotNull
	@ManyToOne
	@JoinColumn(name = "userFollowerId", nullable = false)
	private Users followerUser;

	@NotNull
	@ManyToOne
	@JoinColumn(name = "userFolloweeId", nullable = false)
	private Users followeeUser;

}
