package com.instragram.project.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileResponse {
    private String bioText;
    private String profilePictureUrl;
}
