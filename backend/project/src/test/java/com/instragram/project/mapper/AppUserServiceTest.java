package com.instragram.project.mapper;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.instragram.project.dto.request.SignUpRequestDto;
import com.instragram.project.model.AppUser;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentRepository;
import com.instragram.project.repository.PostRepository;
import com.instragram.project.service.AppUserService;


@ExtendWith(MockitoExtension.class)
public class AppUserServiceTest {

    @Mock
    private AppUserRepository appUserRepository;
   
    @Mock
    private PostRepository  postRepository;
    
    @Mock
    private CommentRepository commentRepository;

    @Mock
    private MappingMethods mappingMethods;
    
    @InjectMocks
    private AppUserService appUserService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    
  
    @Test
    void signUp_shouldCreateUserSuccessfullyWhenUsernameIsUnique() {
        SignUpRequestDto requestDto = new SignUpRequestDto();
        requestDto.setEmail("admin123@hotmail.com");
        requestDto.setUsername("admin123");
        requestDto.setPassword("password");

        AppUser appUser = new AppUser();
        when(mappingMethods.convertSignUpRequestToAppUserEntity(requestDto)).thenReturn(appUser);

        appUserService.signUp(requestDto);

        verify(appUserRepository).save(appUser);
    }

    @Test
    void signUp_shouldThrowRuntimeExceptionWhenUsernameAlreadyExists() {
       
        AppUser appUser = new AppUser();
        appUser.setUsername("admin123");
        appUser.setPassword(encoder.encode("password"));

        SignUpRequestDto requestDto = new SignUpRequestDto();
        requestDto.setEmail("admin123@hotmail.com");
        requestDto.setUsername("admin123");
        requestDto.setPassword("password");
    }

    

}
