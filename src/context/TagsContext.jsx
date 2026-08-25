import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  findParamInURL
} from "../utils/urlManipulation";

const TagsContext = createContext();

function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return a === b;
  if (a.length !== b.length) return false;
  return a.every((value, idx) => value === b[idx]);
}

export const TagsProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [fields, setFields] = useState({
    orase: [],
    remote: [],
    company: [],
    experienta: []
  });

  // State hooks initialized from URL
  const [q, setQ] = useState(() => findParamInURL("q") || []);
  const [city, setCity] = useState(() => findParamInURL("orase") || []);
  const [remote, setRemote] = useState(() => findParamInURL("remote") || []);
  const [company, setCompany] = useState(() => findParamInURL("company") || []);
  const [county, setCounty] = useState(() => findParamInURL("judete") || []);

  // Utility to extract current parameters from window hash or standard search
  const getCurrentParams = useCallback(() => {
    const rawSearch = location.hash.includes("?")
      ? location.hash.split("?")[1]
      : location.search;
    return new URLSearchParams(rawSearch);
  }, [location.hash, location.search]);

  // Handle Checkbox Changes via Navigation (pushing new history entry)
  const handleCheckBoxChange = (e, type) => {
    const { value, checked } = e.target;
    const params = getCurrentParams();

    const currentValues = params.get(type) ? params.get(type).split(",") : [];
    let updatedValues = [...currentValues];

    if (checked) {
      if (!updatedValues.includes(value)) {
        updatedValues.push(value);
      }
    } else {
      updatedValues = updatedValues.filter((item) => item !== value);
    }

    if (updatedValues.length > 0) {
      params.set(type, updatedValues.join(","));
    } else {
      params.delete(type);
    }

    const targetPath = location.pathname.includes("rezultate")
      ? location.pathname
      : "/rezultate";

    navigate(`${targetPath}?${params.toString()}`, { replace: false });
  };

  // Handle Removing Single Tag via Navigation (pushing new history entry)
  const removeTag = (type, value) => {
    const params = getCurrentParams();
    const currentParam = params.get(type);

    if (!currentParam) return;

    const updatedValues = currentParam
      .split(",")
      .filter((item) => item.trim() !== String(value).trim());

    if (updatedValues.length > 0) {
      params.set(type, updatedValues.join(","));
    } else {
      params.delete(type);
    }

    const targetPath = location.pathname.includes("rezultate")
      ? location.pathname
      : "/rezultate";

    navigate(`${targetPath}?${params.toString()}`, { replace: false });
  };

  // Context Setters wrapped in useCallback
  const contextSetQ = useCallback((text) => {
    setQ((prev) => (arraysEqual(prev, text) ? prev : text));
  }, []);

  const contextSetCity = useCallback((text) => {
    setCity((prev) => (arraysEqual(prev, text) ? prev : text));
  }, []);

  const contextSetCounty = useCallback((text) => {
    setCounty((prev) => (arraysEqual(prev, text) ? prev : text));
  }, []);

  const contextSetCompany = useCallback((text) => {
    setCompany((prev) => (arraysEqual(prev, text) ? prev : text));
  }, []);

  const contextSetRemote = useCallback((text) => {
    setRemote((prev) => (arraysEqual(prev, text) ? prev : text));
  }, []);

  const contextSetField = useCallback((fieldName, value) => {
    const allowedFields = ["orase", "remote", "company"];
    if (!allowedFields.includes(fieldName) || !value) return;

    const newValue = Array.isArray(value) ? value : [value];

    switch (fieldName) {
      case "orase":
        setCity(newValue);
        break;
      case "remote":
        setRemote(newValue);
        break;
      case "company":
        setCompany(newValue);
        break;
      default:
        return;
    }

    setFields((prev) => ({
      ...prev,
      [fieldName]: newValue
    }));
  }, []);

  // Sync internal UI tag arrays whenever state primitives change from URL
  useEffect(() => {
    setFields({
      orase: city.filter(Boolean),
      remote: remote.filter(Boolean),
      company: company.filter(Boolean),
      experienta: []
    });
  }, [city, remote, company]);

  const [deletAll, setDeletAll] = useState(false);

  const handleRemoveAllFilters = () => {
    const params = getCurrentParams();

    // Preserve search string 'q' if present, clear filters
    const qValue = params.get("q");
    const newParams = new URLSearchParams();
    if (qValue) newParams.set("q", qValue);

    const targetPath = location.pathname.includes("rezultate")
      ? location.pathname
      : "/rezultate";

    navigate(`${targetPath}?${newParams.toString()}`, { replace: false });
  };

  useEffect(() => {
    const { orase, remote, company, experienta } = fields;
    const allFieldsEmpty =
      orase.length === 0 &&
      remote.length === 0 &&
      company.length === 0 &&
      experienta.length === 0;
    setDeletAll(allFieldsEmpty);
  }, [fields]);

  return (
    <TagsContext.Provider
      value={{
        q,
        city,
        county,
        remote,
        company,
        deletAll,
        fields,
        handleRemoveAllFilters,
        handleCheckBoxChange,
        removeTag,
        contextSetQ,
        contextSetCity,
        contextSetField,
        contextSetCounty,
        contextSetCompany,
        contextSetRemote
      }}
    >
      {children}
    </TagsContext.Provider>
  );
};

export default TagsContext;