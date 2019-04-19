// 获取当前时间
function getCurrentTime(type) {
  let now = new Date();
  let year = now.getFullYear();       //年
  let month = now.getMonth() + 1;     //月
  let day = now.getDate();            //日
  let hh = now.getHours();            //时
  let mm = now.getMinutes();          //分
  let ss = now.getSeconds();          //分
  let clock = year + "-";
  if (month < 10) clock += "0";
  clock += month + "-";
  if (day < 10) clock += "0";
  clock += day + " ";
  if (hh < 10) clock += "0";
  clock += hh + ":";
  if (mm < 10) clock += '0';
  clock += mm + ":";
  if (ss < 10) clock += '0';
  clock += ss;
  return (clock);
}
// 根据年份和月份获取月份天数
function getDayCount(year, month) {
  let day = new Date(year, month, 1, 0, 0, 0);
  let lastDay = new Date(day - 1000);
  return lastDay.getDate();
}
// 
function getItem(list, n = 1) {
  let numArray = [];
  for (let i = Number(list[0]); i <= Number(list[1]); i += n) {
    let number = i < 10 ? `0${i}` : `${i}`;
    numArray.push(number)
  }
  return numArray
}

// 获取可选年份
function getYears(startYear, endYear) {
  let eachList = [startYear, endYear];
  return getItem(eachList)
}

// 获取可选月份
function getMonths(startYear, currentYear, endYear, startMonth, endMonth) {
  let eachList = [1, 12];
  if (startYear == currentYear && endYear == currentYear) {
    eachList = [startMonth, endMonth]
  } else if (startYear == currentYear && endYear != currentYear) {
    eachList = [startMonth, 12]
  } else if (startYear != currentYear && endYear == currentYear) {
    eachList = [1, endMonth]
  }
  return getItem(eachList)
}
// 获取可选日期
function getDays(currentYear, startMonth, currentMonth, endMonth, startDay, endDay) {
  let dayCount = getDayCount(currentYear, currentMonth); // 根据年月获取每月天数
  let eachList = [1, dayCount];

  if (startMonth == currentMonth && endMonth == currentMonth) {
    eachList = [startDay, endDay]
  } else if (startMonth == currentMonth && endMonth != currentMonth) {
    eachList = [startDay, dayCount]
  } else if (startMonth != currentMonth && endMonth == currentMonth) {
    eachList = [1, endDay]
  }
  return getItem(eachList)
}
// 获取可选小时
function getHours(type, begin, current, over) {
  let eachList = [0, 23];
  if (type === 'date') {
    let isBegin =
      begin[0] == current[0] &&
      begin[1] == current[1] &&
      begin[2] == current[2];
    let isOver =
      over[0] == current[0] &&
      over[1] == current[1] &&
      over[2] == current[2];
    if (isBegin && isOver) {
      eachList = [begin[3], over[3]]
    } else if (isBegin && !isOver) {
      eachList = [begin[3], 23]
    } else if (!isBegin && isOver) {
      eachList = [0, over[3]]
    }
  } else if (type === 'time') {
    eachList = [begin[0], over[0]];
  }
  return getItem(eachList)
}
function getMinutes(type, begin, current, over, stepMinutes) {
  let eachList = [0, 59];
  if (type === 'date') {
    let isBegin =
      begin[0] == current[0] &&
      begin[1] == current[1] &&
      begin[2] == current[2] &&
      begin[3] == current[3]
    let isOver =
      over[0] == current[0] &&
      over[1] == current[1] &&
      over[2] == current[2] &&
      over[3] == current[3]
    if (isBegin && isOver) {
      eachList = [begin[4], over[4]]
    } else if (isBegin && !isOver) {
      eachList = [begin[4], 59]
    } else if (!isBegin && isOver) {
      eachList = [0, over[4]]
    }
  } else if (type === 'time') {
    if (begin[0] == current[0] && over[0] == current[0]) {
      eachList = [begin[1], over[1]]
    } else if (begin[0] == current[0] && over[0] != current[0]) {
      eachList = [begin[1], 59]
    } else if (begin[0] != current[0] && over[0] == current[0]) {
      eachList = [0, over[1]]
    }
  }
  return getItem(eachList, stepMinutes)
}
// 获取可选秒数
function getSeconds(type, begin, current, over, stepSeconds) {
  let eachList = [0, 59];
  if (type === 'date') {
    let isBegin =
      begin[0] == current[0] &&
      begin[1] == current[1] &&
      begin[2] == current[2] &&
      begin[3] == current[3] &&
      begin[4] == current[4]
    let isOver =
      over[0] == current[0] &&
      over[1] == current[1] &&
      over[2] == current[2] &&
      over[3] == current[3] &&
      over[4] == current[4]

    if (isBegin && isOver) {
      eachList = [begin[5], over[5]]
    } else if (isBegin && !isOver) {
      eachList = [begin[5], 59]
    } else if (!isBegin && isOver) {
      eachList = [0, over[5]]
    }
  } else if (type === 'time') {
    let isBegin = begin[0] == current[0] && begin[1] == current[1]
    let isOver = over[0] == current[0] && over[1] == current[1]
    if (isBegin && isOver) {
      eachList = [begin[2], over[2]]
    } else if (isBegin && !isOver) {
      eachList = [begin[2], 59]
    } else if (!isBegin && isOver) {
      eachList = [0, over[2]]
    }
  }
  return getItem(eachList, stepSeconds)
}
// 获取完整日期
function getTimeSpace(type, begin, current, over, format, stepMinutes, stepSeconds) {
  let timeSpace = [];
  switch (type) {
    // 匹配日期模式
    case 'yyyy-mm-dd hh:mm:ss':
      timeSpace.push(getYears(begin[0], over[0]))
      timeSpace.push(getMonths(begin[0], current[0], over[0], begin[1], over[1]))
      timeSpace.push(getDays(current[0], begin[1], current[1], over[1], begin[2], over[2]))
      timeSpace.push(getHours('date', begin, current, over))
      timeSpace.push(getMinutes('date', begin, current, over, stepMinutes))
      timeSpace.push(getSeconds('date', begin, current, over, stepSeconds))
      break;
    case 'yyyy-mm-dd hh:mm':
      timeSpace.push(getYears(begin[0], over[0]))
      timeSpace.push(getMonths(begin[0], current[0], over[0], begin[1], over[1]))
      timeSpace.push(getDays(current[0], begin[1], current[1], over[1], begin[2], over[2]))
      timeSpace.push(getHours('date', begin, current, over))
      timeSpace.push(getMinutes('date', begin, current, over, stepMinutes))
      break;
    case 'yyyy-mm-dd hh':
      timeSpace.push(getYears(begin[0], over[0]))
      timeSpace.push(getMonths(begin[0], current[0], over[0], begin[1], over[1]))
      timeSpace.push(getDays(current[0], begin[1], current[1], over[1], begin[2], over[2]))
      timeSpace.push(getHours('date', begin, current, over))
      break;
    case 'yyyy-mm-dd':
      timeSpace.push(getYears(begin[0], over[0]))
      timeSpace.push(getMonths(begin[0], current[0], over[0], begin[1], over[1]))
      timeSpace.push(getDays(current[0], begin[1], current[1], over[1], begin[2], over[2]))
      break;
    case 'hh:mm:ss':
      timeSpace.push(getHours('time', begin, current, over))
      timeSpace.push(getMinutes('time', begin, current, over, stepMinutes))
      timeSpace.push(getSeconds('time', begin, current, over, stepSeconds))
      break;
    case 'hh:mm':
      timeSpace.push(getHours('time', begin, current, over))
      timeSpace.push(getMinutes('time', begin, current, over, stepMinutes))
      break;
  }
  timeSpace = timeSpace.map((item, index) => {
    return item.map(value => value + format[index])
  })

  return timeSpace
}

const date = {
  getCurrentTime,
  getTimeSpace
}

export default date