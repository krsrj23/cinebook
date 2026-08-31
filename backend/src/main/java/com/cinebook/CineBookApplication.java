package com.cinebook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * CineBook backend entry point. @EnableScheduling turns on the
 * HoldExpiryService's every-30-seconds hold-release job.
 */
@SpringBootApplication
@EnableScheduling
public class CineBookApplication {

    public static void main(String[] args) {
        SpringApplication.run(CineBookApplication.class, args);
    }
}
