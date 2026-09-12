package com.instragram.project.security.users;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.instragram.project.model.AppUser;
import com.instragram.project.repository.AppUserRepository;

@Service
public class AppUserDetailsService implements UserDetailsService {

   private final AppUserRepository appUserRepository;

   public AppUserDetailsService(AppUserRepository appUserRepository) {
      this.appUserRepository = appUserRepository;
   }

   /** 
    *  Loads the user details by username.
    *  @param username the username of the user to load
    *  @return the user details
    *  @throws UsernameNotFoundException if the user is not found
    */
   @Override
   public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
      AppUser appUser = appUserRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User '" + username + "' not found"));
      return new AppUserPrincipal(appUser);
   }

}