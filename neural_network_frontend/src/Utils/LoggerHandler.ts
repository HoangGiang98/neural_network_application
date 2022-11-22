const tableLog = (logName: string, logObj: any): void => {
  if (logObj === undefined) {
    return;
  }
  console.groupCollapsed(logName);
  console.table(logObj);
  console.groupEnd();
};

const collapsedLog = (logName: string, logObj: any): void => {
  if (logObj === undefined) {
    return;
  }
  console.groupCollapsed(logName);
  console.log(logObj);
  console.groupEnd();
};

const logGroupWrapper = (
  groupLogName: string,
  logFn: () => void,
  isCollapsed: boolean = false
) => {
  isCollapsed
    ? console.groupCollapsed(groupLogName)
    : console.group(groupLogName);
  logFn();
  console.groupEnd();
};

const Logger = {
  collapsedLog,
  tableLog,
  logGroupWrapper,
};

export default Logger;
