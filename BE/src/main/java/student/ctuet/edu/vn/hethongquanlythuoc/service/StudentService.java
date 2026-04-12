package student.ctuet.edu.vn.hethongquanlythuoc.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.Student;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.dto.student.StudentResponse;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.AppException;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.ErrorCode;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.StudentRepository;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Transactional
    public List<StudentResponse> importFromExcel(MultipartFile file) throws Exception {

        String filename = file.getOriginalFilename();
        Workbook workbook = (filename != null && filename.endsWith(".xlsx"))
                ? new XSSFWorkbook(file.getInputStream())
                : new HSSFWorkbook(file.getInputStream());

        Sheet sheet = workbook.getSheetAt(0);

        Row headerRow = sheet.getRow(4);

        Map<String, Integer> colIndex = new HashMap<>();
        for (Cell cell : headerRow) {
            String name = cell.getStringCellValue().trim();
            colIndex.put(name, cell.getColumnIndex());
        }

        List<Student> students = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (int i = 5; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null)
                continue;

            String mssv = getCellString(row, colIndex, "Mã sinh viên");
            if (mssv == null || mssv.isBlank())
                continue;

            if (!mssv.matches("^[A-Z]+\\d+.*$"))
                continue;

            Student student = studentRepository.findByStudentCode(mssv)
                    .orElse(new Student());

            student.setStudentCode(mssv);
            student.setLastName(getCellString(row, colIndex, "Họ"));
            student.setFirstName(getCellString(row, colIndex, "Tên"));
            student.setGender(getCellString(row, colIndex, "Giới tính"));
            student.setClassCode(getCellString(row, colIndex, "Mã lớp"));
            student.setFaculty(getCellString(row, colIndex, "Khoa"));
            student.setInsuranceCode(getCellString(row, colIndex, "Mã BHXH_YT"));

            String ngaySinhStr = getCellString(row, colIndex, "Ngày sinh");
            if (ngaySinhStr != null && !ngaySinhStr.isBlank()) {
                try {
                    student.setDateOfBirth(LocalDate.parse(ngaySinhStr, formatter));
                } catch (Exception ignored) {
                }
            }

            students.add(student);
        }

        workbook.close();

        studentRepository.saveAll(students);
        return students.stream()
                .map(this::mapToResponse)
                .toList();
    }

    //======================== Get Student =========================
    public StudentResponse getByStudentCode(String studentCode) {
        Student student = studentRepository.findByStudentCode(studentCode)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));
        return mapToResponse(student);
    }

    // ========================= GET ALL =========================
    public List<StudentResponse> getStudents() {
        return studentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ========================= HELPER =========================
    // tìm đúng cột trong excel dựa vào tên cột đã cho, ròi lấy giá trị ô đó
    private String getCellString(Row row, Map<String, Integer> colIndex, String colName) {
        Integer idx = colIndex.get(colName);
        if (idx == null)
            return null;
        return getCellString(row.getCell(idx));
    }

    private String getCellString(Cell cell) {
        if (cell == null)
            return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((long) cell.getNumericCellValue());
        }
        return cell.getStringCellValue().trim();
    }

    private StudentResponse mapToResponse(Student student) {
        return new StudentResponse(
                student.getStudentCode(),
                student.getLastName() + " " + student.getFirstName(),
                student.getDateOfBirth(),
                student.getGender(),
                student.getInsuranceCode(),
                student.getClassCode(),
                student.getFaculty());
    }
}