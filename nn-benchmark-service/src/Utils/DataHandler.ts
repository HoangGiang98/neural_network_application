import fse, { PathOrFileDescriptor } from "fs-extra";
import Papa from "papaparse";
import { BmMLParsedData } from "Types/types";

export default class DataHandler {
  static getLocalCsvData(
    path: PathOrFileDescriptor,
    options: { encoding?: BufferEncoding; flag?: string } = { encoding: 'utf8' }
  ): string | Buffer | undefined {
    try {
      const csvFile = fse.readFileSync(path, options);
      return csvFile.toString();
    } catch (error) {
      console.error(`Error: ${error as string}`);
      return undefined;
    }
  }

  static parseCsvData(
    data: string | Buffer | undefined
  ): BmMLParsedData | undefined {
    if (typeof data !== 'string') {
      console.error(`Error: Data has the wrong format or is undefined 
      `);
      return undefined;
    }
    const parsedResult = Papa.parse<unknown[]>(data, {
      dynamicTyping: true,
      skipEmptyLines: true,
    });
    const extractedData = DataHandler.extractData(parsedResult);
    return extractedData;
  }

  static extractData(
    parsedResult: Papa.ParseResult<unknown[]>
  ): BmMLParsedData {
    const header = parsedResult.data[0].map((category) => {
      if (typeof category !== 'string') {
        throw new Error('First line of the CSV file is not of type string');
      }
      return category[0].toUpperCase() + category.slice(1);
    });
    const body = parsedResult.data.slice(1);
    const uniqueClasses: string[] = [];
    for (const elem of body) {
      const [lastElem] = elem.slice(-1) as string[];
      if (uniqueClasses.includes(lastElem)) {
        elem.splice(-1, 1, uniqueClasses.indexOf(lastElem));
        continue;
      }
      uniqueClasses.push(lastElem);
      elem.splice(-1, 1, uniqueClasses.indexOf(lastElem));
    }
    const xDims = body[0].length - 1;
    const numberOfClasses = uniqueClasses.length;
    return {
      header: header,
      body: body,
      classes: uniqueClasses,
      xDims: xDims,
      numberOfClasses: numberOfClasses,
    };
  }
}
