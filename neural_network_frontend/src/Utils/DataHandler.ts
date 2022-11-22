import { BmMLParsedData } from "Types/types";

export const extractData = (
  parsedResult: Papa.ParseResult<unknown[]>
): BmMLParsedData => {
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
};

// To clone memoryInfo from performance API and avoid Data Clone Error
export const cloneMemoryInfo = (memory: Record<string, unknown>) => {
  const { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } = memory as {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
  return { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize };
};

// To clone PerformanceEntries with detail property
export const clonePerformanceMeasure = (
  perfMeasureList: PerformanceEntryList
) => {
  return (perfMeasureList as PerformanceMeasure[]).map((perf) => ({
    name: perf.name,
    entryType: perf.entryType,
    startTime: perf.startTime,
    duration: perf.duration,
    detail: perf.detail,
  }));
};
