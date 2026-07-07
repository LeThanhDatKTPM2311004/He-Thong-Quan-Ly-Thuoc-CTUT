package student.ctuet.edu.vn.hethongquanlythuoc.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import student.ctuet.edu.vn.hethongquanlythuoc.domain.Prescription;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.PrescriptionDetail;
import student.ctuet.edu.vn.hethongquanlythuoc.domain.Student;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.AppException;
import student.ctuet.edu.vn.hethongquanlythuoc.exception.ErrorCode;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.PrescriptionDetailRepository;
import student.ctuet.edu.vn.hethongquanlythuoc.repository.PrescriptionRepository;

@Service
public class PrescriptionPdfExportService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionDetailRepository detailRepository;

    public PrescriptionPdfExportService(PrescriptionRepository prescriptionRepository,
            PrescriptionDetailRepository detailRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.detailRepository = detailRepository;
    }

    public byte[] exportPrescription(String prescriptionCode) throws Exception {

        Prescription prescription = prescriptionRepository.findById(prescriptionCode)
                .orElseThrow(() -> new AppException(ErrorCode.PRESCRIPTION_NOT_FOUND));

        Student student = prescription.getStudent();
        List<PrescriptionDetail> details = detailRepository
                .findByPrescriptionPrescriptionCode(prescriptionCode);

        // ── Font hỗ trợ tiếng Việt (dùng chung file times.ttf bạn đã có) ──
        BaseFont baseFont = BaseFont.createFont(
                new ClassPathResource("fonts/times.ttf").getURL().toString(),
                BaseFont.IDENTITY_H, BaseFont.EMBEDDED);

        Font fontNormal = new Font(baseFont, 12, Font.NORMAL);
        Font fontBold = new Font(baseFont, 12, Font.BOLD);
        Font fontItalic = new Font(baseFont, 11, Font.ITALIC);
        Font fontTitle = new Font(baseFont, 16, Font.BOLD);
        Font fontHeaderSchool = new Font(baseFont, 13, Font.BOLD);
        Font fontTableHeader = new Font(baseFont, 11, Font.BOLD);
        Font fontTableData = new Font(baseFont, 11, Font.NORMAL);
        Font fontTableNote = new Font(baseFont, 10, Font.ITALIC);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 30, 30);
        PdfWriter.getInstance(doc, out);
        doc.open();

        // ── Header trường ──
        Paragraph truong = new Paragraph("TRƯỜNG ĐẠI HỌC KỸ THUẬT - CÔNG NGHỆ CẦN THƠ", fontHeaderSchool);
        truong.setAlignment(Element.ALIGN_CENTER);
        doc.add(truong);

        Paragraph diaChi = new Paragraph(
                "Địa chỉ: 256 Nguyễn Văn Cừ, phường An Hòa, quận Ninh Kiều, TP Cần Thơ", fontNormal);
        diaChi.setAlignment(Element.ALIGN_CENTER);
        doc.add(diaChi);

        Paragraph dienThoai = new Paragraph("Điện thoại: 0374.618.299", fontNormal);
        dienThoai.setAlignment(Element.ALIGN_CENTER);
        doc.add(dienThoai);

        // ── Tiêu đề ──
        Paragraph title = new Paragraph("ĐƠN THUỐC", fontTitle);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingBefore(15);
        title.setSpacingAfter(15);
        doc.add(title);

        // ── Thông tin bệnh nhân ──
        doc.add(labelValue("Họ tên: ", fullName(student), fontBold, fontNormal));

        String ngaySinh = student.getDateOfBirth() != null
                ? student.getDateOfBirth().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                : "..../..../........";
        doc.add(twoLabelValue(
                "Ngày sinh: ", ngaySinh,
                "Giới tính: ", safe(student.getGender()),
                fontBold, fontNormal));

        doc.add(labelValue("Số thẻ bảo hiểm y tế: ", safe(student.getInsuranceCode()), fontBold, fontNormal));

        doc.add(twoLabelValue(
                "Mã số sinh viên: ", safe(student.getStudentCode()),
                "Lớp: ", safe(student.getClassCode()),
                fontBold, fontNormal));

        doc.add(labelValue("Chẩn đoán: ", safe(prescription.getDiagnosis()), fontBold, fontNormal));

        Paragraph chiDinh = new Paragraph("Chỉ định dùng thuốc:", fontBold);
        chiDinh.setSpacingBefore(10);
        chiDinh.setSpacingAfter(5);
        doc.add(chiDinh);

        // ── Bảng thuốc ──
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setWidths(new float[] { 70, 15, 15 });

        table.addCell(headerCell("Tên thuốc - Cách dùng", fontTableHeader));
        table.addCell(headerCell("Số lượng", fontTableHeader));
        table.addCell(headerCell("Đơn vị", fontTableHeader));

        int stt = 1;
        for (PrescriptionDetail detail : details) {

            PdfPCell nameCell = new PdfPCell();
            nameCell.setPadding(5);

            Paragraph namePara = new Paragraph(
                    stt + ". " + detail.getMedicine().getName(), fontTableHeader);
            nameCell.addElement(namePara);

            if (detail.getNote() != null && !detail.getNote().isBlank()) {
                Paragraph notePara = new Paragraph(detail.getNote(), fontTableNote);
                nameCell.addElement(notePara);
            }
            table.addCell(nameCell);

            table.addCell(dataCell(String.valueOf(detail.getQuantity()), fontTableData));
            table.addCell(dataCell(safe(detail.getUnit()), fontTableData));

            stt++;
        }

        doc.add(table);

        // ── Lời dặn ──
        Paragraph loiDan = labelValue("Lời dặn: ", safe(prescription.getNote()), fontBold, fontNormal);
        loiDan.setSpacingBefore(12);
        doc.add(loiDan);

        // ── Khối chữ ký ──
        LocalDate ngayTao = prescription.getCreatedAt() != null
                ? prescription.getCreatedAt()
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDate()
                : LocalDate.now();

        PdfPTable sig = new PdfPTable(2);
        sig.setWidthPercentage(100);
        sig.setSpacingBefore(20);
        sig.getDefaultCell().setBorder(PdfPCell.NO_BORDER);

        PdfPCell patientCell = new PdfPCell();
        patientCell.setBorder(PdfPCell.NO_BORDER);
        patientCell.setPaddingTop(10);

        Paragraph patientTitle = new Paragraph("Bệnh nhân", fontBold);
        patientTitle.setAlignment(Element.ALIGN_CENTER);
        patientCell.addElement(patientTitle);

        Paragraph patientHint = new Paragraph("(Ký, ghi rõ họ tên)", fontItalic);
        patientHint.setAlignment(Element.ALIGN_CENTER);
        patientHint.setSpacingBefore(40);
        patientCell.addElement(patientHint);

        sig.addCell(patientCell);

        PdfPCell staffCell = new PdfPCell();
        staffCell.setBorder(PdfPCell.NO_BORDER);
        staffCell.setPaddingTop(10);

        Paragraph dateLine = new Paragraph(
                "Cần Thơ, ngày " + ngayTao.getDayOfMonth() + " tháng "
                        + ngayTao.getMonthValue() + " năm " + ngayTao.getYear(),
                fontItalic);
        dateLine.setAlignment(Element.ALIGN_CENTER);
        staffCell.addElement(dateLine);

        Paragraph staffTitle = new Paragraph("Y sỹ khám bệnh", fontBold);
        staffTitle.setAlignment(Element.ALIGN_CENTER);
        staffCell.addElement(staffTitle);

        Paragraph staffName = new Paragraph(safe(prescription.getMedicalStaff()), fontBold);
        staffName.setAlignment(Element.ALIGN_CENTER);
        staffName.setSpacingBefore(40);
        staffCell.addElement(staffName);

        sig.addCell(staffCell);

        doc.add(sig);

        doc.close();
        return out.toByteArray();
    }

    // ========================= HELPER =========================

    private Paragraph labelValue(String label, String value, Font labelFont, Font valueFont) {
        Paragraph p = new Paragraph();
        p.add(new com.lowagie.text.Chunk(label, labelFont));
        p.add(new com.lowagie.text.Chunk(value, valueFont));
        p.setSpacingBefore(5);
        return p;
    }

    private Paragraph twoLabelValue(String label1, String value1, String label2, String value2,
            Font labelFont, Font valueFont) {
        Paragraph p = new Paragraph();
        p.add(new com.lowagie.text.Chunk(label1, labelFont));
        p.add(new com.lowagie.text.Chunk(value1 + "          ", valueFont));
        p.add(new com.lowagie.text.Chunk(label2, labelFont));
        p.add(new com.lowagie.text.Chunk(value2, valueFont));
        p.setSpacingBefore(5);
        return p;
    }

    private PdfPCell headerCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        return cell;
    }

    private PdfPCell dataCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        return cell;
    }

    private String fullName(Student student) {
        return safe(student.getLastName()) + " " + safe(student.getFirstName());
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}