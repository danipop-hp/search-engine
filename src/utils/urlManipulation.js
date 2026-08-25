export const updateUrlParams = (paramsToUpdate) => {
  const currentHref = window.location.href;
  const hashIndex = currentHref.indexOf("#");

  if (hashIndex === -1) {
    const currentUrl = new URL(currentHref);
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || value === "") {
        currentUrl.searchParams.delete(key);
      } else if (Array.isArray(value)) {
        currentUrl.searchParams.set(key, value.filter(Boolean).join(","));
      } else {
        currentUrl.searchParams.set(key, value);
      }
    });
    window.history.pushState(null, "", currentUrl.pathname + currentUrl.search);
  } else {
    const baseUrl = currentHref.substring(0, hashIndex);
    const hashPathAndQuery = currentHref.substring(hashIndex);

    const qIndex = hashPathAndQuery.indexOf("?");
    let hashPath = hashPathAndQuery;
    let searchParams = new URLSearchParams();

    if (qIndex !== -1) {
      hashPath = hashPathAndQuery.substring(0, qIndex);
      searchParams = new URLSearchParams(hashPathAndQuery.substring(qIndex + 1));
    }

    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || value === "") {
        searchParams.delete(key);
      } else if (Array.isArray(value)) {
        searchParams.set(key, value.filter(Boolean).join(","));
      } else {
        searchParams.set(key, value);
      }
    });

    const queryString = searchParams.toString();
    const newHash = queryString ? `${hashPath}?${queryString}` : hashPath;
    const newUrl = baseUrl + newHash;

    window.history.pushState(null, "", newUrl);
  }
};

export const removeFiltersFromURL = () => {
  const currentHash = window.location.hash || "#/rezultate";
  const [baseHash, queryString] = currentHash.split("?");
  if (!queryString) return;

  const params = new URLSearchParams(queryString);
  const qParam = params.get("q");
  
  // Keep only 'q' parameter if present, drop all filter parameters
  const newHash = qParam ? `${baseHash}?q=${qParam}` : baseHash;

  window.history.replaceState({}, "", newHash);
};

export const getParamsFromURL = () => {
  const queryString =
    window.location.search || window.location.hash.split("?")[1];
  const params = new URLSearchParams(queryString);
  const paramsObj = {};

  for (const [key, value] of params.entries()) {
    paramsObj[key] = value.includes(",") ? value.split(",") : value;
  }

  return paramsObj;
};

export const findParamInURL = (key) => {
  const paramsObj = getParamsFromURL();
  if (paramsObj[key]) {
    if (Array.isArray(paramsObj[key])) {
      return paramsObj[key].filter(Boolean);
    }
    return [paramsObj[key]];
  }
  return null;
};