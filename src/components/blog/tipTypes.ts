export interface Tip {
  cat: string; // category, used for the filter chips and the row color
  title: string;
  summary: string; // one line, shown in the list
  body: string;
  say?: string; // the exact line, if the tip has one
  whenLabel?: string; // the moment the line is for
}
