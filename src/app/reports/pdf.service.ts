import { Injectable } from '@angular/core';
import { UtilityService } from '../shared/utility.service';

@Injectable({providedIn: 'root'})
export class PdfService {
  private pdfMake: any;
  public done: boolean = false;  

  constructor(private util: UtilityService) {}

  async loadPdfMaker() {
    if (!this.pdfMake) {
      const pdfMakeModule = await import("pdfmake/build/pdfmake");
      const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
      this.pdfMake = pdfMakeModule.default;
      this.pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
    }
  }

  async generatePdf(title: string, currentUser: string, content?: {}[], imgURL?: string) {
    await this.loadPdfMaker();
    const serverTimestamp = await this.util.getServerTimestamp();
    const docDefinition = {
      info: {title: title},
      pageSize: 'A3',
      pageOrientation: 'Landscape',                                                                       // Portrait
      pageMargins: [36, 18, 36, 45],                                                                      // left, top, right, bottom
      content: content,
      footer: (currentPage, pageCount) => {
        return {
          margin: [36, 9, 36, 18],                                                                        // left, top, right, bottom
          fontSize: 8,
          italics: true,
          columns: [
            {
              alignment: 'left',
              text: title + '\n\n' + currentUser + '\t' + new Date(serverTimestamp).toLocaleString()
            },
            { 
              alignment: 'right',
              text: 'Page ' + currentPage.toString() + ' of ' + pageCount
            }
          ]
        };
      }
    }

    // this.pdfMake.createPdf(docDefinition).open({progressCallback: this.progressCallbackMethod});
    this.pdfMake.createPdf(docDefinition).getDataUrl(function(base64ImageData){
      const contentType = base64ImageData.split(',')[0].split(':')[1].split(';')[0]
      
      const byteCharacters = atob(base64ImageData.substr(`data:${contentType};base64,`.length));
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
      
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
          }
      
          const byteArray = new Uint8Array(byteNumbers);
      
          byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, {type: contentType});
      const blobUrl = URL.createObjectURL(blob);
      
      window.open(blobUrl, '_blank');
    }, {progressCallback: this.progressCallbackMethod.bind(this)});
  }

  progressCallbackMethod(progress) {
    if (progress > 0.9) {
      this.done = true;
    }
  };
}