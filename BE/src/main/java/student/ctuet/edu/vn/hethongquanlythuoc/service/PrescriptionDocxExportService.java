package student.ctuet.edu.vn.hethongquanlythuoc.service;

import java.io.ByteArrayOutputStream;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTBorder;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTblBorders;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTblGrid;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTblPr;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STBorder;
import org.springframework.stereotype.Service;

import student.ctuet.edu.vn.hethongquanlythuoc.domain.Prescription;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.PrescriptionDetail;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.Student;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.AppException;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.ErrorCode;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.PrescriptionDetailRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.PrescriptionRepository;

/**
 * Sinh file Word (.docx) cho "ĐƠN THUỐC" theo mẫu mau-don-thuoc-2022.docx
 * dùng Apache POI (XWPF). Không cần đọc file mẫu lúc runtime — toàn bộ
 * layout được dựng lại bằng code cho dễ chỉnh sửa và không phụ thuộc
 * đường dẫn tới file .docx gốc.
 */
@Service
public class PrescriptionDocxExportService {

    private static final String FONT = "Times New Roman";

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionDetailRepository detailRepository;

    public PrescriptionDocxExportService(PrescriptionRepository prescriptionRepository,
            PrescriptionDetailRepository detailRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.detailRepository = detailRepository;
    }

    // ========================= EXPORT =========================
    public byte[] exportPrescription(String prescriptionCode) throws Exception {

        Prescription prescription = prescriptionRepository.findById(prescriptionCode)
                .orElseThrow(() -> new AppException(ErrorCode.PRESCRIPTION_NOT_FOUND));

        Student student = prescription.getStudent();

        List<PrescriptionDetail> details = detailRepository
                .findByPrescriptionPrescriptionCode(prescriptionCode);

        try (XWPFDocument doc = new XWPFDocument()) {

            // ── Header trường ──
            addParagraph(doc, "TRƯỜNG ĐẠI HỌC KỸ THUẬT - CÔNG NGHỆ CẦN THƠ",
                    13, true, false, ParagraphAlignment.CENTER);
            addParagraph(doc, "Địa chỉ: 256 Nguyễn Văn Cừ, phường An Hòa, quận Ninh Kiều, TP Cần Thơ",
                    12, false, false, ParagraphAlignment.CENTER);
            addParagraph(doc, "Điện thoại: 0374.618.299",
                    12, false, false, ParagraphAlignment.CENTER);

            addEmptyLine(doc);

            // ── Tiêu đề ──
            addParagraph(doc, "ĐƠN THUỐC", 16, true, false, ParagraphAlignment.CENTER);

            addEmptyLine(doc);

            // ── Thông tin bệnh nhân ──
            addLabelValueLine(doc, "Họ tên: ", fullName(student));

            String ngaySinh = student.getDateOfBirth() != null
                    ? student.getDateOfBirth().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                    : "..../..../........";

            addTwoLabelLine(doc,
                    "Ngày sinh: ", ngaySinh,
                    "Giới tính: ", safe(student.getGender()));

            addLabelValueLine(doc, "Số thẻ bảo hiểm y tế: ", safe(student.getInsuranceCode()));

            addTwoLabelLine(doc,
                    "Mã số sinh viên: ", safe(student.getStudentCode()),
                    "Lớp: ", safe(student.getClassCode()));

            addLabelValueLine(doc, "Chẩn đoán: ", safe(prescription.getDiagnosis()));

            addEmptyLine(doc);
            addParagraph(doc, "Chỉ định dùng thuốc:", 12, true, false, ParagraphAlignment.LEFT);

            // ── Bảng thuốc ──
            addMedicineTable(doc, details);

            addEmptyLine(doc);
            addLabelValueLine(doc, "Lời dặn: ", safe(prescription.getNote()));

            addEmptyLine(doc);

            // ── Khối chữ ký ──
            addSignatureBlock(doc, prescription);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.write(out);
            return out.toByteArray();
        }
    }

    // ========================= BẢNG THUỐC =========================
    private void addMedicineTable(XWPFDocument doc, List<PrescriptionDetail> details) {

        int rows = details.size() + 1; // +1 dòng header
        XWPFTable table = doc.createTable(rows, 3);

        // độ rộng cột tính theo twips (1 cm = 567 twips), tổng ~ 17.5cm
        int[] widthsDxa = { 7100, 1500, 1500 };
        setColumnWidths(table, widthsDxa);

        // ── Header ──
        String[] headers = { "Tên thuốc - Cách dùng", "Số lượng", "Đơn vị" };
        XWPFTableRow headerRow = table.getRow(0);
        for (int i = 0; i < headers.length; i++) {
            XWPFTableCell cell = headerRow.getCell(i);
            cell.removeParagraph(0);
            XWPFParagraph p = cell.addParagraph();
            p.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun r = p.createRun();
            r.setText(headers[i]);
            r.setBold(true);
            r.setFontFamily(FONT);
            r.setFontSize(11);
        }

        // ── Dữ liệu ──
        int stt = 1;
        for (PrescriptionDetail detail : details) {

            XWPFTableRow row = table.getRow(stt);

            // Cột 1: tên thuốc (đậm) + hướng dẫn dùng / ghi chú (nghiêng)
            XWPFTableCell nameCell = row.getCell(0);
            nameCell.removeParagraph(0);

            XWPFParagraph namePara = nameCell.addParagraph();
            XWPFRun nameRun = namePara.createRun();
            nameRun.setText(stt + ". " + detail.getMedicine().getName());
            nameRun.setBold(true);
            nameRun.setFontFamily(FONT);
            nameRun.setFontSize(11);

            if (detail.getNote() != null && !detail.getNote().isBlank()) {
                XWPFParagraph notePara = nameCell.addParagraph();
                XWPFRun noteRun = notePara.createRun();
                noteRun.setText(detail.getNote());
                noteRun.setItalic(true);
                noteRun.setFontFamily(FONT);
                noteRun.setFontSize(10);
            }

            // Cột 2: số lượng
            XWPFTableCell qtyCell = row.getCell(1);
            qtyCell.removeParagraph(0);
            XWPFParagraph qtyPara = qtyCell.addParagraph();
            qtyPara.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun qtyRun = qtyPara.createRun();
            qtyRun.setText(String.valueOf(detail.getQuantity()));
            qtyRun.setFontFamily(FONT);
            qtyRun.setFontSize(11);

            // Cột 3: đơn vị
            XWPFTableCell unitCell = row.getCell(2);
            unitCell.removeParagraph(0);
            XWPFParagraph unitPara = unitCell.addParagraph();
            unitPara.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun unitRun = unitPara.createRun();
            unitRun.setText(safe(detail.getUnit()));
            unitRun.setFontFamily(FONT);
            unitRun.setFontSize(11);

            stt++;
        }
    }

    // ========================= KHỐI CHỮ KÝ =========================
    private void addSignatureBlock(XWPFDocument doc, Prescription prescription) {

        XWPFTable sig = doc.createTable(1, 2);
        removeTableBorders(sig);
        setColumnWidths(sig, new int[] { 5000, 5100 });

        XWPFTableCell patientCell = sig.getRow(0).getCell(0);
        patientCell.removeParagraph(0);

        XWPFParagraph p1 = patientCell.addParagraph();
        p1.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun r1 = p1.createRun();
        r1.setText("Bệnh nhân");
        r1.setBold(true);
        r1.setFontFamily(FONT);
        r1.setFontSize(12);

        patientCell.addParagraph();
        patientCell.addParagraph();

        XWPFParagraph p1b = patientCell.addParagraph();
        p1b.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun r1b = p1b.createRun();
        r1b.setText("(Ký, ghi rõ họ tên)");
        r1b.setItalic(true);
        r1b.setFontFamily(FONT);
        r1b.setFontSize(11);

        XWPFTableCell staffCell = sig.getRow(0).getCell(1);
        staffCell.removeParagraph(0);

        LocalDate ngayTao = prescription.getCreatedAt() != null
                ? prescription.getCreatedAt()
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDate()
                : LocalDate.now();

        XWPFParagraph p2 = staffCell.addParagraph();
        p2.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun r2 = p2.createRun();
        r2.setText("Cần Thơ, ngày " + ngayTao.getDayOfMonth() + " tháng "
                + ngayTao.getMonthValue() + " năm " + ngayTao.getYear());
        r2.setItalic(true);
        r2.setFontFamily(FONT);
        r2.setFontSize(12);

        XWPFParagraph p3 = staffCell.addParagraph();
        p3.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun r3 = p3.createRun();
        r3.setText("Y sỹ khám bệnh");
        r3.setBold(true);
        r3.setFontFamily(FONT);
        r3.setFontSize(12);

        staffCell.addParagraph();
        staffCell.addParagraph();

        XWPFParagraph p4 = staffCell.addParagraph();
        p4.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun r4 = p4.createRun();
        r4.setText(safe(prescription.getMedicalStaff()));
        r4.setBold(true);
        r4.setFontFamily(FONT);
        r4.setFontSize(12);
    }

    // ========================= HELPER: PARAGRAPH THƯỜNG =========================
    private void addParagraph(XWPFDocument doc, String text, int size, boolean bold, boolean italic,
            ParagraphAlignment align) {
        XWPFParagraph p = doc.createParagraph();
        p.setAlignment(align);
        XWPFRun r = p.createRun();
        r.setText(text);
        r.setBold(bold);
        r.setItalic(italic);
        r.setFontFamily(FONT);
        r.setFontSize(size);
    }

    private void addEmptyLine(XWPFDocument doc) {
        doc.createParagraph();
    }

    // "Nhãn: " (đậm) + giá trị (thường) trên cùng 1 dòng
    private void addLabelValueLine(XWPFDocument doc, String label, String value) {
        XWPFParagraph p = doc.createParagraph();
        XWPFRun labelRun = p.createRun();
        labelRun.setText(label);
        labelRun.setBold(true);
        labelRun.setFontFamily(FONT);
        labelRun.setFontSize(12);

        XWPFRun valueRun = p.createRun();
        valueRun.setText(value);
        valueRun.setFontFamily(FONT);
        valueRun.setFontSize(12);
    }

    // 2 cặp "Nhãn: giá trị" trên cùng 1 dòng, ví dụ: "Ngày sinh: ... Giới tính:
    // ..."
    private void addTwoLabelLine(XWPFDocument doc, String label1, String value1, String label2, String value2) {
        XWPFParagraph p = doc.createParagraph();

        XWPFRun r1 = p.createRun();
        r1.setText(label1);
        r1.setBold(true);
        r1.setFontFamily(FONT);
        r1.setFontSize(12);

        XWPFRun r2 = p.createRun();
        r2.setText(value1 + "          "); // khoảng cách giữa 2 cặp nhãn/giá trị
        r2.setFontFamily(FONT);
        r2.setFontSize(12);

        XWPFRun r3 = p.createRun();
        r3.setText(label2);
        r3.setBold(true);
        r3.setFontFamily(FONT);
        r3.setFontSize(12);

        XWPFRun r4 = p.createRun();
        r4.setText(value2);
        r4.setFontFamily(FONT);
        r4.setFontSize(12);
    }

    // ========================= HELPER: BẢNG =========================
    private void setColumnWidths(XWPFTable table, int[] widthsDxa) {
        CTTblGrid grid = table.getCTTbl().addNewTblGrid();
        for (int w : widthsDxa) {
            grid.addNewGridCol().setW(BigInteger.valueOf(w));
        }
        for (XWPFTableRow row : table.getRows()) {
            List<XWPFTableCell> cells = row.getTableCells();
            for (int i = 0; i < cells.size() && i < widthsDxa.length; i++) {
                cells.get(i).setWidth(String.valueOf(widthsDxa[i]));
            }
        }
    }

    private void removeTableBorders(XWPFTable table) {
        CTTblPr tblPr = table.getCTTbl().getTblPr();
        if (tblPr == null) {
            tblPr = table.getCTTbl().addNewTblPr();
        }
        CTTblBorders borders = tblPr.addNewTblBorders();
        for (String edge : new String[] { "top", "left", "bottom", "right", "insideH", "insideV" }) {
            CTBorder border = switch (edge) {
                case "top" -> borders.addNewTop();
                case "left" -> borders.addNewLeft();
                case "bottom" -> borders.addNewBottom();
                case "right" -> borders.addNewRight();
                case "insideH" -> borders.addNewInsideH();
                default -> borders.addNewInsideV();
            };
            border.setVal(STBorder.NIL);
        }
    }

    // ========================= HELPER: DỮ LIỆU =========================
    private String fullName(Student student) {
        return safe(student.getLastName()) + " " + safe(student.getFirstName());
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}