package me.noahvdaa.hangartotal.controller;

import io.papermc.hangar.scanner.HangarJarScanner;
import io.papermc.hangar.scanner.check.Check;
import io.papermc.hangar.scanner.check.MethodCheck;
import io.papermc.hangar.scanner.model.ScanResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ScanController {

    @PostMapping("/scan")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No file was specified");

        HangarJarScanner scanner = new HangarJarScanner();
        try {
            ScanResult result = scanner.scanJar(file.getInputStream(), file.getResource().getFilename());

            Map<String, Object> response = new HashMap<>();
            response.put("highestSeverity", result.highestSeverity());

            List<Map<String, Object>> results = new ArrayList<>();
            for (Check.CheckResult checkResult : result.results()) {
                Map<String, Object> checkResponse = new HashMap<>();

                checkResponse.put("type", checkResult.getClass().getSimpleName());
                checkResponse.put("severity", checkResult.severity());
                checkResponse.put("location", checkResult.location());
                checkResponse.put("message", checkResult.message());

                if (checkResult instanceof MethodCheck.MethodCheckResult methodResult) {
                    checkResponse.put("methodName", methodResult.methodNode().name);
                    checkResponse.put("methodDescriptor", methodResult.methodNode().desc);
                    checkResponse.put("class", methodResult.classNode().name);
                } else if (checkResult instanceof Check.ExceptionCheckResult exceptionResult) {
                    checkResponse.put("exception", exceptionResult.exception());
                }

                results.add(checkResponse);
            }
            response.put("results", results);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "An IO error occured");
        }
    }

}
