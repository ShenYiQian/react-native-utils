export function getCurrentLocation() {
    return new Promise(function(resolve,reject) {
        navigator.geolocation.getCurrentPosition(
            (location) => resolve(location),
            (error) => resolve({coords:{longitude:-1,latitude:-1}})
        );
    })
};

export function formatDateString(timestamp) {
  const date = new Date(parseInt(timestamp) * 1000);
  const year = date.getFullYear();
  const month = parseInt(date.getMonth()) + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
};

export function formatStringWithHtml(originString) {
  const newString = originString
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  return newString;
};