package student.ctuet.edu.vn.hethongquanlythuoc.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.student.StudentResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.service.StudentService;
import student.ctuet.edu.vn.hethongquanlythuoc.utils.ApiResponse;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> importExcel(
            @RequestParam("file") MultipartFile file) throws Exception {

        List<StudentResponse> response = studentService.importFromExcel(file);
        return ResponseEntity.ok(ApiResponse.success(
                "Import thành công " + response.size() + " sinh viên", response));
    }

    @GetMapping("/{studentCode}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudent(
            @PathVariable String studentCode) {

        StudentResponse response = studentService.getByStudentCode(studentCode);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thông tin sinh viên thành công",
                response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getStudents() {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách sinh viên thành công",
                studentService.getStudents()));
    }

}