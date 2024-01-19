import { Component } from '@angular/core';
import jsPDF from 'jspdf';
// import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'
import { applyPlugin } from 'jspdf-autotable'
import { companyName } from 'src/app/constants';
applyPlugin(jsPDF)

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {
  public headers: any;
  private widths: number[] = [];
  constructor() {
    this.headers = this.createHeaders([
      "Sr.No.",
      "Particulars",
      "Quantity",
      "Unit",
      "Rate",
      "Amount",
      "GST%",
      "GST",
      "Net Amount"
    ]);
  }

  createHeaders(keys: any) {
    var result = [];
    this.widths = [20, 80, 25, 20, 20, 25, 20, 20, 30]
    for (var i = 0; i < keys.length; i += 1) {
      result.push({
        id: keys[i],
        name: keys[i],
        prompt: keys[i],
        width: this.widths[i],
        align: "left",
        padding: 0
      });
    }
    return result;
  }

  generateData = (amount: any) => {
    const result = [];
    const data: any = {
      Particulars: "Test test",
      Quantity: "Box",
      Unit: "XPTO2",
      Rate: "25",
      Amount: "20485861",
      'GST%': "0",
      GST: '2220',
      'Net Amount': '3333330'
    };
    for (var i = 0; i < amount; i += 1) {
      data['Sr.No.'] = (i + 1).toString();
      result.push(Object.assign({}, data));
    }
    return result;
  };

  save() {
    const doc: any = new jsPDF({ putOnlyUsedFonts: true });
    doc.setFontSize(20);
    doc.text("Invoice", 90, 15)
    // doc.autoTable({ html: '#my-table' })
    // doc.text("Wishvayodha Multitrade", 14, 20);
    doc.setFontSize(10);
    doc.text("Tax Invoice:", 150, 30)
    // doc.setFont('', 'bold');
    doc.text("394893", 170, 30)

    doc.text("Supplier Name:", 14, 30);
    doc.text(companyName, 40, 30);

    doc.line(14, 35, 196, 35);
    doc.setFontSize(10);

    doc.text("Bill No: 293", 14, 40)
    doc.text("Firm Name: " + companyName, 14, 45)

    doc.text("Date: 12/12/2013", 150, 40)
    // doc.text("Firm Name: Wishvayodha Multitrade", 10, 40)

    doc.line(14, 50, 196, 50);

    // doc.table(10, 50, this.generateData(10), this.headers, { fontSize: 7, });
    // 
    // const doc2 = new jsPDF();
    (doc as any).autoTable({
      head: [[
        "Sr.No.",
        "Particulars",
        "Quantity",
        "Unit",
        "Rate",
        "Amount",
        "GST%",
        "GST",
        "Net Amount"
      ]],
      body: [
        ['1', '293939 Clutch Clutch Clutch', '1', 'NOS', '100', '333', '18%', '190', '1200'],
        ['2', '394033 Wheel Clutch Clutch Clutch', '1', 'BOX', '50', '333', '18%', '190', '1200'],
        // ...
      ],
      theme: 'striped',
      startY: 55,
      margin: [10, 15, 30, 15] // top left bottom left
    });
    const tableHeight = doc.autoTableEndPosY();

    doc.line(14, tableHeight + 5, 196, tableHeight + 5);
    doc.text('In Word: RS: One Thousand Two Hundred Only', 14, tableHeight + 10)
    doc.text("Basic Amount: 10020", 150, tableHeight + 10)
    doc.text("GST Amount:   203030", 150, tableHeight + 15)
    doc.text("Net Discount: 120", 150, tableHeight + 20)
    doc.line(14, tableHeight + 25, 196, tableHeight + 25);

    doc.line(14, doc.internal.pageSize.height - 30, 196, doc.internal.pageSize.height - 30);

    if (tableHeight < doc.internal.pageSize.height - 50) {
      doc.text('Signature', 14, doc.internal.pageSize.height - 10);
      doc.text('Seal', 150, doc.internal.pageSize.height - 10);
    }
    // doc.save("report-purchase.pdf");
    window.open(doc.output('bloburl'), '_blank');
  }


}