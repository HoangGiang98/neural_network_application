import "./DataTable.scss";

import { BmMLParsedData } from "Types/types";

export interface BmMLDataTableProps {
  parsedCsvData: BmMLParsedData;
}

const DataTable = (props: BmMLDataTableProps) => {
  return (
    <>
      <table id='data-table'>
        <thead>
          <tr>
            {props.parsedCsvData.header &&
              props.parsedCsvData.header.length !== 0 &&
              props.parsedCsvData.header.map((parsedHeader, headerIndex) => (
                <th key={headerIndex}>{parsedHeader}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {props.parsedCsvData.body &&
            props.parsedCsvData.body.length !== 0 &&
            props.parsedCsvData.body
              .slice(0, 20)
              .map((parsedData, dataIndex) => (
                <tr key={dataIndex}>
                  {parsedData.map((dataCell, cellIndex) => {
                    if (cellIndex === parsedData.length - 1) {
                      return (
                        <td key={cellIndex}>
                          {props.parsedCsvData.classes[dataCell as string]}{' '}
                        </td>
                      );
                    }
                    return <td key={cellIndex}> {dataCell} </td>;
                  })}
                </tr>
              ))}
        </tbody>
      </table>
    </>
  );
};

export default DataTable;
