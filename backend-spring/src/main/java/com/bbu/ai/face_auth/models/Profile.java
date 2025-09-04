package com.bbu.ai.face_auth.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Profiles")
public class Profile {

    @Id
    private long id;

    private String avatar;

    private String firstName;

    private String lastName;

    private String workExperience;

    private String currentWorkPlace;

}
