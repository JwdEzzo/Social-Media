package com.instragram.project.security.users;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.instragram.project.model.AppUser;
import com.instragram.project.repository.AppUserRepository;

@Service
public class AppUserDetailsService implements UserDetailsService {

   @Autowired
   private AppUserRepository appUserRepository;

   @Override
   public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
      AppUser appUser = appUserRepository.findByUsername(username);
      if (appUser == null) {
         throw new UsernameNotFoundException("User '" + username + "' not found");
      } else {
         return new AppUserPrincipal(appUser);

      }
   }

}