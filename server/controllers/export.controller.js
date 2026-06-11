import ExcelJS from 'exceljs';
import Expense from '../models/Expense.js';

// @desc    Export expenses to formatted Excel (.xlsx) file
// @route   GET /api/export/excel
export const exportToExcel = async (req, res) => {
  try {
    const userId = req.user._id;
    const { from, to, category, paymentMode, minAmount, maxAmount, search } = req.query;

    // Build filters exactly like GET /api/expenses
    const query = { userId };

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (paymentMode && paymentMode !== 'All') {
      query.paymentMode = paymentMode;
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    if (search && search.trim() !== '') {
      const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.$or = [
        { remark: { $regex: escapedSearch, $options: 'i' } },
        { category: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    // Fetch matching data
    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Spendly Statement');

    // Header Column Definitions
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 16 },
      { header: 'Category', key: 'category', width: 22 },
      { header: 'Amount (₹)', key: 'amount', width: 16 },
      { header: 'Remark', key: 'remark', width: 35 },
      { header: 'Payment Mode', key: 'paymentMode', width: 18 },
    ];

    // Style Header Row (Indigo color fill, white bold text)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 26;
    headerRow.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4F46E5' }, // Premium Indigo Theme
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };

    // Fill data rows
    expenses.forEach((exp) => {
      // Formatted local date
      const d = new Date(exp.date);
      const formattedDate = d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      worksheet.addRow({
        date: formattedDate,
        category: exp.category,
        amount: exp.amount,
        remark: exp.remark || '',
        paymentMode: exp.paymentMode,
      });
    });

    // Style data cells
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      row.height = 21;
      row.alignment = { vertical: 'middle', horizontal: 'left' };

      row.eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } },
        };
      });

      // Format Amount currency cell
      const amountCell = row.getCell(3); // Column C
      amountCell.numFmt = '₹#,##0.00';
      amountCell.alignment = { vertical: 'middle', horizontal: 'right' };
    });

    // Set Autofilter
    worksheet.autoFilter = {
      from: 'A1',
      to: `E${expenses.length + 1}`,
    };

    // Filename: expense-statement-YYYY-MM.xlsx
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const filename = `expense-statement-${year}-${month}.xlsx`;

    // Response configuration
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Excel export controller error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
