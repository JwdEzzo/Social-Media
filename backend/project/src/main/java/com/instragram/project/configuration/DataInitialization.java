package com.instragram.project.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.instragram.project.model.AppUser;
import com.instragram.project.repository.AppUserRepository;

@Component
public class DataInitialization implements CommandLineRunner {

   @Autowired
   private AppUserRepository appUserRepository;

   private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

   @Override
   public void run(String... args) throws Exception {

      if (appUserRepository.findByUsername("admin123") == null
            && appUserRepository.findByUsername("admin456") == null
            && appUserRepository.findByUsername("admin789") == null) {
         AppUser user = new AppUser();
         user.setUsername("admin123");
         user.setPassword(encoder.encode("admin123"));
         user.setEmail("admin@hotmail.com");
         appUserRepository.save(user);

         AppUser user2 = new AppUser();
         user2.setUsername("admin456");
         user2.setPassword(encoder.encode("admin456"));
         user2.setEmail("admin2@hotmail.com");
         appUserRepository.save(user2);

         AppUser user3 = new AppUser();
         user3.setUsername("admin789");
         user3.setPassword(encoder.encode("admin789"));
         user3.setEmail("admin3@hotmail.com");
         appUserRepository.save(user3);

         System.out.println("=== DEFAULT ADMIN USER CREATED ===");
         System.out.println("Username: admin123 , admin456 , admin789");
         System.out.println("Password: admin123 , admin456 , admin789");
         System.out.println("Please change this password after first login!");
         System.out.println("==================================");
      } else {
         System.out.println("=== USERS ALREADY EXISTS ===");
      }
   }
   //    if (appUserRepository.findByUsername("admin123") == null) {
   //       AppUser user = new AppUser();
   //       user.setUsername("admin123");
   //       user.setPassword(encoder.encode("admin123"));
   //       user.setEmail("admin@hotmail.com");
   //       appUserRepository.save(user);

   //       AppUser user2 = new AppUser();
   //       user2.setUsername("admin456");
   //       user2.setPassword(encoder.encode("admin456"));
   //       user2.setEmail("admin2@hotmail.com");
   //       appUserRepository.save(user2);

   //       System.out.println("=== DEFAULT ADMIN USER CREATED ===");
   //       System.out.println("Username: admin123 , admin456");
   //       System.out.println("Password: admin123 , admin456");
   //       System.out.println("Please change this password after first login!");
   //       System.out.println("==================================");
   //    } else {
   //       System.out.println("=== USERS ALREADY EXISTS ===");
   //    }
   // }
}