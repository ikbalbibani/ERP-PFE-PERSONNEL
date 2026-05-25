package iteam.salesapi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin("*")
public class UploadController {

    private static final String UPLOAD_DIR =
            System.getProperty("user.dir")
                    + "/uploads/users/";

    @PostMapping("/user-image")
    public ResponseEntity<String> uploadUserImage(
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        // vérifier image vide
        if (file.isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Image vide");
        }

        // créer dossier si absent
        File directory = new File(UPLOAD_DIR);

        if (!directory.exists()) {
            directory.mkdirs();
        }

        // nom unique image
        String filename =
                UUID.randomUUID()
                        + "_"
                        + file.getOriginalFilename();

        // chemin final
        String filePath = UPLOAD_DIR + filename;

        // sauvegarde image
        file.transferTo(new File(filePath));

        // URL retournée
        String imageUrl =
                "/uploads/users/" + filename;

        return ResponseEntity.ok(imageUrl);
    }
}