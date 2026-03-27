import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const REPORT_COLORS = {
    border: [203, 213, 225],
    surface: [255, 255, 255],
    surfaceSoft: [248, 250, 252],
    surfaceAccent: [239, 246, 255],
    title: [15, 23, 42],
    body: [71, 85, 105],
    muted: [100, 116, 139],
    headingBlue: [96, 165, 250],
    headingBlueText: [30, 64, 175],
};

const formatMetricValue = (value) => `${Number(value ?? 0)}%`;

const formatMetricLabel = (key) => key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

const sanitizePdfFileName = (value) => (value || 'analytics-report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

const addWrappedTextBlock = (pdf, text, startY, options = {}) => {
    const {
        margin = 14,
        width = pdf.internal.pageSize.getWidth() - (margin * 2),
        fontSize = 10.5,
        lineHeight = 5.2,
        color = [51, 65, 85],
    } = options;

    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);

    const lines = pdf.splitTextToSize(text || 'N/A', width);
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentY = startY;

    lines.forEach((line) => {
        if (currentY + lineHeight > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
        }

        pdf.text(line, margin, currentY);
        currentY += lineHeight;
    });

    return currentY;
};

const addParagraphSection = (pdf, title, text, startY, accentColor) => {
    const margin = 14;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    const sectionPadding = 6;
    const bodyLines = pdf.splitTextToSize(text || 'N/A', contentWidth - (sectionPadding * 2));
    const estimatedHeight = 12 + Math.max(bodyLines.length, 1) * 5.2 + (sectionPadding * 2);

    if (startY + estimatedHeight > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        startY = margin;
    }

    pdf.setDrawColor(226, 232, 240);
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, startY, contentWidth, estimatedHeight, 3, 3, 'FD');

    pdf.setFillColor(...accentColor);
    pdf.roundedRect(margin, startY, 2.2, estimatedHeight, 1, 1, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(title, margin + sectionPadding, startY + 8);

    const nextY = addWrappedTextBlock(pdf, text, startY + 15, {
        margin: margin + sectionPadding,
        width: contentWidth - (sectionPadding * 2),
        fontSize: 10.2,
        lineHeight: 5,
        color: [71, 85, 105],
    });

    return Math.max(nextY + sectionPadding, startY + estimatedHeight + 2);
};

const drawMetricCard = (pdf, x, y, width, title, value, accentColor) => {
    pdf.setFillColor(...REPORT_COLORS.surface);
    pdf.setDrawColor(...REPORT_COLORS.border);
    pdf.roundedRect(x, y, width, 22, 3, 3, 'FD');

    pdf.setFillColor(...accentColor);
    pdf.roundedRect(x + 4, y + 4, 7, 14, 2, 2, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...REPORT_COLORS.muted);
    pdf.text(title.toUpperCase(), x + 14, y + 8);

    pdf.setFontSize(17);
    pdf.setTextColor(...REPORT_COLORS.title);
    pdf.text(value, x + 14, y + 17);
};

export const downloadMatchReportPdf = ({ match, aiData, jobTitle, resumeName }) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);
    let cursorY = margin;

    const goToNextSection = (requiredHeight = 12) => {
        if (cursorY + requiredHeight > pageHeight - margin) {
            pdf.addPage();
            cursorY = margin;
        }
    };

    pdf.setDrawColor(...REPORT_COLORS.border);
    pdf.setFillColor(...REPORT_COLORS.surfaceAccent);
    pdf.roundedRect(margin, cursorY, contentWidth, 31, 4, 4, 'FD');
    pdf.setFillColor(...REPORT_COLORS.headingBlue);
    pdf.roundedRect(margin, cursorY, 4, 31, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(21);
    pdf.setTextColor(...REPORT_COLORS.title);
    pdf.text('SkillSync.ai Match Report', margin + 8, cursorY + 12);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(...REPORT_COLORS.headingBlueText);
    pdf.text('Analytics summary with ATS, skills, and recommendation breakdown.', margin + 8, cursorY + 19);

    pdf.setTextColor(...REPORT_COLORS.muted);
    pdf.text(`Generated on ${new Date(match.created_at).toLocaleDateString()}`, margin + 8, cursorY + 25);
    cursorY += 39;

    pdf.setDrawColor(...REPORT_COLORS.border);
    pdf.setFillColor(...REPORT_COLORS.surfaceSoft);
    pdf.roundedRect(margin, cursorY, contentWidth, 24, 3, 3, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...REPORT_COLORS.muted);
    pdf.text('RESUME', margin + 5, cursorY + 7);
    pdf.text('JOB', margin + 70, cursorY + 7);

    pdf.setFontSize(12);
    pdf.setTextColor(...REPORT_COLORS.title);
    pdf.text(resumeName || 'N/A', margin + 5, cursorY + 15);
    pdf.text(jobTitle || 'N/A', margin + 70, cursorY + 15);
    cursorY += 32;

    const metricGap = 4;
    const metricWidth = (contentWidth - metricGap) / 2;
    drawMetricCard(pdf, margin, cursorY, metricWidth, 'Overall Match', formatMetricValue(aiData.overall_match_percentage), [59, 130, 246]);
    drawMetricCard(pdf, margin + metricWidth + metricGap, cursorY, metricWidth, 'ATS Score', formatMetricValue(aiData.ats_best_practice?.ats_score), [34, 197, 94]);
    cursorY += 26;
    drawMetricCard(pdf, margin, cursorY, metricWidth, 'Semantic Score', formatMetricValue(aiData.scores?.semantic_score), [168, 85, 247]);
    drawMetricCard(pdf, margin + metricWidth + metricGap, cursorY, metricWidth, 'Keyword Score', formatMetricValue(aiData.scores?.keyword_score), [249, 115, 22]);
    cursorY += 26;
    drawMetricCard(pdf, margin, cursorY, contentWidth, 'Keyword Gap', formatMetricValue(aiData.scores?.keyword_gap), [239, 68, 68]);
    cursorY += 30;

    goToNextSection(38);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(...REPORT_COLORS.title);
    pdf.text('ATS Best Practices', margin, cursorY);
    cursorY += 6;

    const atsRows = Object.entries(aiData.ats_best_practice || {})
        .filter(([key]) => key !== 'ats_score')
        .map(([key, value]) => [formatMetricLabel(key), String(value ?? 'N/A')]);

    if (atsRows.length > 0) {
        autoTable(pdf, {
            startY: cursorY,
            margin: { left: margin, right: margin },
            head: [['Check', 'Details']],
            body: atsRows,
            theme: 'grid',
            styles: {
                fontSize: 9.5,
                cellPadding: 3,
                lineColor: REPORT_COLORS.border,
                lineWidth: 0.2,
                textColor: REPORT_COLORS.body,
                overflow: 'linebreak',
            },
            headStyles: {
                fillColor: [219, 234, 254],
                textColor: REPORT_COLORS.headingBlueText,
                fontStyle: 'bold',
            },
            columnStyles: {
                0: { cellWidth: 48, fontStyle: 'bold', textColor: REPORT_COLORS.title },
            },
        });
        cursorY = pdf.lastAutoTable.finalY + 10;
    } else {
        cursorY = addParagraphSection(pdf, 'ATS Notes', 'No ATS best-practice details are available for this report.', cursorY, [34, 197, 94]);
    }

    goToNextSection(42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(...REPORT_COLORS.title);
    pdf.text('Skills Analysis', margin, cursorY);
    cursorY += 6;

    const skillRows = (aiData.skills_analysis || []).map((skill) => [
        String(skill.skill ?? 'N/A'),
        String(skill.resume_count ?? 0),
        String(skill.job_count ?? 0),
        String(skill.gap ?? 0),
        skill.matched ? 'Yes' : 'No',
    ]);

    if (skillRows.length > 0) {
        autoTable(pdf, {
            startY: cursorY,
            margin: { left: margin, right: margin },
            head: [['Skill', 'Resume', 'Job', 'Gap', 'Matched']],
            body: skillRows,
            theme: 'striped',
            showHead: 'everyPage',
            pageBreak: 'auto',
            rowPageBreak: 'avoid',
            styles: {
                fontSize: 9.5,
                cellPadding: 3,
                overflow: 'linebreak',
                textColor: REPORT_COLORS.body,
                lineColor: REPORT_COLORS.border,
                lineWidth: 0.15,
            },
            headStyles: {
                fillColor: [224, 242, 254],
                textColor: REPORT_COLORS.headingBlueText,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: REPORT_COLORS.surfaceSoft,
            },
            columnStyles: {
                0: { cellWidth: 72, fontStyle: 'bold', textColor: REPORT_COLORS.title },
                4: { cellWidth: 22 },
            },
        });
        cursorY = pdf.lastAutoTable.finalY + 10;
    } else {
        cursorY = addParagraphSection(pdf, 'Skills Analysis', 'No skills analysis data is available for this report.', cursorY, [59, 130, 246]);
    }

    cursorY = addParagraphSection(pdf, 'Strengths', aiData.strengths, cursorY, [34, 197, 94]);
    cursorY = addParagraphSection(pdf, 'Weaknesses', aiData.weaknesses, cursorY, [239, 68, 68]);
    addParagraphSection(pdf, 'Detailed Analysis', aiData.ai_text || 'No report available.', cursorY, [59, 130, 246]);

    const fileLabel = sanitizePdfFileName(`${resumeName || 'resume'}-${jobTitle || 'job'}-report`);
    pdf.save(`${fileLabel}.pdf`);
};
