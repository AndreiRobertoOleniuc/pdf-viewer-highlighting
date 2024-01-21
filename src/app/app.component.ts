import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PdfViewerModule } from 'ng2-pdf-viewer';

interface HighlightedText {
  startRange: number;
  endRange: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PdfViewerModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  //Solution
  /*

  WORKING ON THI:
  Work with innerText and use the text itself as a key for the highlighted text object.
  Meaning if on Page 1 I hightlight from Index 0 to Index 10, then I store the text as a key in the object.
  Then I can use the text as a key to find the highlighted text object.
  Then I can use the object to find the span on the page and apply the highlight.

  Marvin suggestions: instead of highlightedText, it's a list of highlightsFromAndTo [ { from: 0, to: 10 }] for example. Meaning when retrieving from
  backend, we avoid errors where same word gets highlighted twice.
  */
  pdfSrc = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
  displayUnderlyingText: boolean = false;
  rawSpans: {
    row: Element;
    highlightedText: HighlightedText[];
    rawText: string;
  }[] = [];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  pageRendered(e: CustomEvent) {
    document.querySelectorAll('.pdf-viewer span').forEach((span) => {
      if (!this.rawSpans.find((s) => s.rawText === span.textContent)) {
        this.rawSpans.push({
          row: span,
          highlightedText: [],
          rawText: span.textContent || '',
        });
      } else {
        this.rawSpans.find((s) => s.rawText === span.textContent)!.row = span;
      }
      this.highLightText();
    });
  }

  checkSpans() {
    console.log(this.rawSpans);
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedSpans = this.findSpansInRange(range);
      if (selectedSpans.length > 0 && range.toString().length > 0) {
        selectedSpans.forEach((line) => {
          this.rawSpans
            .find((s) => s.row === line.span)!
            .highlightedText.push({
              startRange: line.start,
              endRange: line.end,
            });
          this.highLightText();
        });
      }
    }
  }

  private findSpansInRange(
    range: Range
  ): { span: Element; start: number; end: number }[] {
    const spans: { span: Element; start: number; end: number }[] = [];
    const spanElements = document.querySelectorAll('.pdf-viewer span');

    spanElements.forEach((span) => {
      const spanRange = document.createRange();
      spanRange.selectNode(span);
      if (range.intersectsNode(span)) {
        const start = range.startOffset;
        const end = range.endOffset;
        spans.push({ span, start, end });
      }
    });

    return spans;
  }

  private highLightText() {
    //For each span in rawSpans, add a child span inside the span with the highlighted text where the text was found that matches highlightedText
    this.rawSpans.forEach((span) => {
      if (span.highlightedText.length > 0) {
        const spanElement = span.row;
        const text = span.rawText;
        const highlightedText: HighlightedText[] = span.highlightedText;

        highlightedText.forEach((highlight) => {
          const startRange = highlight.startRange;
          const endRange = highlight.endRange;

          const spanTextBeforeHighlight = text.substring(0, startRange);
          const spanTextAfterHighlight = text.substring(endRange);
          const spanTextElement =
            "<span style='background-color: yellow'>" +
            text.substring(startRange, endRange) +
            '</span>';

          spanElement.innerHTML =
            spanTextBeforeHighlight + spanTextElement + spanTextAfterHighlight;
        });
      }
    });
  }

  toggleUnderlyingText() {
    this.displayUnderlyingText = !this.displayUnderlyingText;
  }
}

// const highlightedTextIndex = highlightedText[0].startRange;
// const highlightedTextLength = highlightedText.length;
// const spanTextBeforeHighlight = text.substring(0, highlightedTextIndex);
// const spanTextAfterHighlight = text.substring(
//   highlightedTextIndex + highlightedTextLength
// );

// const spanTextElement =
//   "<span style='background-color:yellow'>" +
//   highlightedText +
//   '</span>';

// //How do I insert the highlighted text here?
// spanElement.innerHTML =
//   spanTextBeforeHighlight + spanTextElement + spanTextAfterHighlight;
