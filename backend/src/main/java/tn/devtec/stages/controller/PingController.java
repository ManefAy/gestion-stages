package tn.devtec.stages.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// @RestController = this class answers HTTP requests,
// and what the methods return is automatically converted to JSON
@RestController
// Prefix of every URL of this class: all our API URLs will start with /api
@RequestMapping("/api")
public class PingController {

    // GET http://localhost:8080/api/ping
    // Only used to check that the backend is running
    @GetMapping("/ping")
    public Map<String, String> ping() {
        // A Map becomes a JSON object: {"status":"ok","application":"DevTec Stages"}
        return Map.of(
                "status", "ok",
                "application", "DevTec Stages"
        );
    }
}