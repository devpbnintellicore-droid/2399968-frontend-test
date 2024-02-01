import { useEffect, useState } from "react";
import {
  Thermometer,
  Timer,
  ChefHat,
  CheckCircle,
  Plus,
  Trash2,
} from "lucide-react";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import FormInput from "../../components/forms/FormInput";
import DatePicker from "../../components/forms/DatePicker";
import TimePicker from "../../components/forms/TimePicker";
// import FileUploader from "../../components/forms/FileUploader";
import experimentApi from "../../api/experimentApi";
import toast from "react-hot-toast";
import {
  validateStep1,
  validateStep2,
  validateStep3,
  // validateStep4,
} from "../../validations/experimentValidation";

const steps = [
  { label: "Recipe Info", icon: "" },
  { label: "Cooking Parameters", icon: "" },
  { label: "Output Data", icon: "" },
  { label: "Upload & Submit", icon: "" },
];

const INGREDIENT_UNITS = ["g", "kg", "ml", "l", "tsp", "tbsp", "pcs"];
const OUTPUT_UNITS = ["g", "kg", "ml", "l", "pcs"];

function StepIndicator({ current }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-4 sm:p-6 mb-8 shadow-xl shadow-black/5 dark:shadow-none">
      <div className="relative">
        <div className="absolute top-[17px] left-8 right-8 h-0.5 bg-[var(--border)] rounded-full" />
        <div className="flex justify-between items-start relative z-10">
          {steps.map((s, i) => {
            const done = current > i + 1;
            const active = current === i + 1;
            return (
              <div key={s.label} className="flex flex-col items-center flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-black border-2 transition-all duration-300 ${
                    active || done
                      ? "border-[var(--primary)] shadow-lg shadow-[var(--accent-glow)]"
                      : "border-[var(--border)]"
                  } ${
                    active
                      ? "bg-[var(--primary)] text-white scale-110"
                      : done
                        ? "bg-[var(--primary-glow)] text-[var(--primary)]"
                        : "bg-[var(--bg)] text-[var(--muted)]"
                  }`}
                >
                  {done ? <CheckCircle size={18} strokeWidth={3} /> : i + 1}
                </div>
                <div className="mt-3 hidden sm:block">
                  <div className="text-[10px] text-[var(--muted)] tracking-[0.2em] uppercase font-black text-center">
                    Step {i + 1}
                  </div>
                  <div
                    className={`text-xs mt-0.5 text-center whitespace-nowrap ${
                      active
                        ? "font-black text-[var(--text)]"
                        : "font-bold text-[var(--muted)]"
                    }`}
                  >
                    {s.label}
                  </div>
                </div>
                {/* Mobile label - only for active step */}
                {active && (
                  <div className="sm:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 w-full text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--primary)] bg-[var(--primary-glow)] px-3 py-1 rounded-full border border-[var(--primary)]/20">
                      Step {i + 1}: {s.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Spacer for mobile label */}
      <div className="h-4 sm:hidden" />
    </div>
  );
}

export default function RecipePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    recipeName: "",
    version: "v1.0",
    expDate: "",
    expTime: "",
    temp: "",
    timing: "",
    expTexture: "",
    expOutputValue: "",
    expOutputUnit: "g",
    actTexture: "",
    actOutputValue: "",
    actOutputUnit: "g",
    remarks: "",
    // images: [],
  });
  const [recipeMode, setRecipeMode] = useState("create");
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "g" },
  ]);
  const [customRecipes, setCustomRecipes] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [versionManual, setVersionManual] = useState(false);
  const [versionBumped, setVersionBumped] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [ingredientSuggest, setIngredientSuggest] = useState({
    row: null,
    index: -1,
    open: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customIngredients, setCustomIngredients] = useState([]);
  const [customIngredientsLoaded, setCustomIngredientsLoaded] = useState(false);
  const [savedIngredients, setSavedIngredients] = useState([]);
  const [savedIngredientsLoaded, setSavedIngredientsLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    // Clear error for this field
    if (errors[k]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ck_custom_ingredients");
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setCustomIngredients(parsed);
    } catch {
      // ignore invalid storage
    } finally {
      setCustomIngredientsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!customIngredientsLoaded) return;
    localStorage.setItem(
      "ck_custom_ingredients",
      JSON.stringify(customIngredients),
    );
  }, [customIngredients, customIngredientsLoaded]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedIngredients");
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .filter((item) => item && item.name && item.unit)
          .map((item) => ({
            name: String(item.name).trim(),
            unit: String(item.unit).trim(),
          }))
          .filter((item) => item.name && item.unit);
        setSavedIngredients(cleaned);
      }
    } catch {
      // ignore invalid storage
    } finally {
      setSavedIngredientsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!savedIngredientsLoaded) return;
    localStorage.setItem("savedIngredients", JSON.stringify(savedIngredients));
  }, [savedIngredients, savedIngredientsLoaded]);

  const normalizeRecipeName = (name) =>
    (name || "")
      .replace(/\sv\d+\.\d+$/i, "")
      .trim()
      .toLowerCase();

  const parseVersion = (version) => {
    const match = /^v(\d+)\.(\d+)$/i.exec(String(version || "").trim());
    if (!match) return { major: 1, minor: 0 };
    return { major: parseInt(match[1], 10), minor: parseInt(match[2], 10) };
  };

  const formatVersion = (major, minor) => `v${major}.${minor}`;

  useEffect(() => {
    if (!form.recipeName) return;
    if (versionManual) return;

    const fetchVersion = async () => {
      try {
        const cleanName = form.recipeName
          .replace(/\0/g, "")
          .trim()
          .replace(/\s+/g, " ");

        const res = await experimentApi.getNextVersion(cleanName);

        const backendVersion = res?.version || res?.data?.version;

        setForm((f) => ({
          ...f,
          version: backendVersion ? `v${backendVersion}` : "v1.0",
        }));
      } catch {
        setForm((f) => ({
          ...f,
          version: "v1.0",
        }));
      }
    };

    const debounce = setTimeout(fetchVersion, 400);
    return () => clearTimeout(debounce);
  }, [form.recipeName, versionManual]);

  useEffect(() => {
    setVersionBumped(false);
    setVersionManual(false); // ✅ ADD THIS
  }, [recipeMode, form.recipeName]);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      expOutputUnit: f.expOutputUnit || "g",
      actOutputUnit: f.expOutputUnit || "g",
    }));
  }, []);

  useEffect(() => {
    setForm((f) => ({ ...f, actOutputUnit: f.expOutputUnit || "g" }));
  }, [form.expOutputUnit]);

  const addIngredient = (name = "") => {
    const safeName = typeof name === "string" ? name : "";
    setIngredients((list) => [
      ...list,
      { name: safeName, quantity: "", unit: "g" },
    ]);
    setIngredientSuggest({ row: null, index: -1, open: false });
  };

  const updateIngredient = (index, patch) =>
    setIngredients((list) =>
      list.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );

  const removeIngredient = (index) =>
    setIngredients((list) =>
      list.length === 1 ? list : list.filter((_, i) => i !== index),
    );

  const normalizeIngredientName = (name) => String(name ?? "").trim();

  const findSavedIngredient = (name) => {
    const key = normalizeIngredientName(name).toLowerCase();
    if (!key) return null;
    return (
      savedIngredients.find(
        (item) =>
          String(item.name || "")
            .trim()
            .toLowerCase() === key,
      ) || null
    );
  };

  const saveIngredientUnit = (name, unit) => {
    const trimmedName = normalizeIngredientName(name);
    const trimmedUnit = String(unit ?? "").trim();
    if (!trimmedName || !trimmedUnit) return;
    setSavedIngredients((list) => {
      const exists = list.some(
        (item) =>
          String(item.name || "")
            .trim()
            .toLowerCase() === trimmedName.toLowerCase(),
      );
      if (exists) return list;
      return [...list, { name: trimmedName, unit: trimmedUnit }];
    });
  };

  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);

  useEffect(() => {
    const row = ingredientSuggest.row;
    const open = ingredientSuggest.open;
    if (!open || row === null || row === undefined) {
      setIngredientSuggestions([]);
      return;
    }

    const query = String(ingredients[row]?.name || "").trim();
    if (!query) {
      setIngredientSuggestions([]);
      return;
    }

    const fetchIngredientSuggestions = async () => {
      try {
        const response = await experimentApi.getIngredientSuggestions(query, 7);
        const suggestions = Array.from(
          new Map(
            (response?.data || [])
              .map((item) => ({
                name: String(item?.name || "").trim(),
                unit: String(item?.unit || "g").trim() || "g",
              }))
              .filter((item) => item.name)
              .map((item) => [item.name.toLowerCase(), item]),
          ).values(),
        );
        setIngredientSuggestions(suggestions);
      } catch (error) {
        console.error("Failed to load ingredient suggestions:", error);
        setIngredientSuggestions([]);
      }
    };

    const timeout = setTimeout(fetchIngredientSuggestions, 250);
    return () => clearTimeout(timeout);
  }, [ingredientSuggest.row, ingredientSuggest.open, ingredients]);

  const handleIngredientSelect = (idx, suggestion) => {
    const name = typeof suggestion === "string" ? suggestion : suggestion.name;
    const unitFromSuggestion = suggestion?.unit;
    const saved = findSavedIngredient(name);
    const unit =
      saved?.unit || unitFromSuggestion || ingredients[idx]?.unit || "g";

    updateIngredient(idx, { name, unit });
    setIngredientSuggest({ row: null, index: -1, open: false });
  };

  const handleIngredientCreate = async (idx, name, options = {}) => {
    const trimmed = String(name ?? "").trim();
    if (!trimmed) return;

    const currentUnit = ingredients[idx]?.unit || "g";

    // ✅ Bind API: Persist to backend catalog
    try {
      await experimentApi.addIngredient(trimmed, currentUnit);
    } catch (error) {
      console.error("Failed to persist ingredient to catalog:", error);
    }

    if (options.saveUnit) {
      saveIngredientUnit(trimmed, currentUnit);
    }
    setCustomIngredients((list) =>
      list.some((i) => i.toLowerCase() === trimmed.toLowerCase())
        ? list
        : [...list, trimmed],
    );
    handleIngredientSelect(idx, trimmed);
  };

  const handleIngredientBlur = (idx, name) => {
    const trimmed = String(name ?? "").trim();
    if (!trimmed) return;
    const savedList = savedIngredients.map((item) => item.name);
    const allSuggestions = Array.from(
      new Set([
        ...(ingredientSuggestions || []).map((item) => item.name),
        ...customIngredients,
        ...savedList,
      ]),
    );
    const exists = allSuggestions.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!exists) handleIngredientCreate(idx, trimmed, { saveUnit: false });
  };

  const [recipeSuggestions, setRecipeSuggestions] = useState([]);

  useEffect(() => {
    const query = form.recipeName.trim();
    if (!query) {
      setRecipeSuggestions([]);
      return;
    }

    const fetchRecipeSuggestions = async () => {
      try {
        const response = await experimentApi.getRecipeSuggestions(query, 5);
        const names = Array.from(
          new Set(
            (response?.data || [])
              .map((name) => String(name || "").trim())
              .filter(Boolean),
          ),
        );

        setRecipeSuggestions(names);
      } catch (error) {
        console.error("Failed to load recipe suggestions:", error);
        setRecipeSuggestions([]);
      }
    };

    const timeout = setTimeout(fetchRecipeSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [form.recipeName]);

  const suggestions = recipeSuggestions;
  const isExistingRecipeExact = suggestions.some(
    (name) =>
      normalizeRecipeName(name) === normalizeRecipeName(form.recipeName),
  );

  const handleSelectRecipe = (name) => {
    setForm((f) => ({ ...f, recipeName: name }));
    setRecipeMode("existing");
    setVersionManual(false);
    setShowSuggestions(false);
  };

  const handleCreateRecipe = () => {
    const trimmed = form.recipeName.trim();
    if (!trimmed) return;
    setCustomRecipes((list) =>
      list.some((r) => normalizeRecipeName(r) === normalizeRecipeName(trimmed))
        ? list
        : [...list, trimmed],
    );
    setRecipeMode("create");
    setVersionManual(false);
    setShowSuggestions(false);
  };

  const handleChangeVersionMajor = async () => {
    if (!form.recipeName) return;

    try {
      const res = await experimentApi.getNextVersion(form.recipeName, true);

      const version = res?.version || res?.data?.version;

      setForm((f) => ({
        ...f,
        version: `v${version}`,
      }));

      setVersionBumped(true);
      setVersionManual(true);
    } catch {
      // version bump failed silently — user can retry
    }
  };

  const handleSubmitExperiment = async () => {
    const baseName = form.recipeName.trim();
    if (!baseName) {
      toast.error("Recipe name is required.");
      return;
    }

    if (!form.temp || !form.timing) {
      toast.error("Temperature and duration are required.");
      return;
    }

    // Image upload is currently disabled.
    // const step4Errors = validateStep4(form);
    // if (Object.keys(step4Errors).length > 0) {
    //   setErrors(step4Errors);
    //   setStep(4);
    //   toast.error("Please upload at least one image.");
    //   return;
    // }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append(
        "recipeName",
        baseName.replace(/\sv\d+\.\d+$/i, "").trim(),
      );
      formData.append("isBump", versionBumped);
      formData.append(
        "experimentDate",
        form.expDate
          ? new Date(form.expDate).toISOString()
          : new Date().toISOString(),
      );
      formData.append(
        "experimentTime",
        form.expTime ||
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
      );
      formData.append("temperature", parseFloat(form.temp));
      formData.append("duration", parseInt(form.timing));
      formData.append("expectedTexture", form.expTexture);
      formData.append("achievedTexture", form.actTexture);
      formData.append("expectedOutput", parseFloat(form.expOutputValue) || 0);
      formData.append("actualOutput", parseFloat(form.actOutputValue) || 0);
      formData.append("remarks", form.remarks);

      const ingredientsData = ingredients
        .filter((ing) => ing.name.trim() && ing.quantity)
        .map((ing) => ({
          name: ing.name.trim(),
          quantity: parseFloat(ing.quantity),
          unit: ing.unit,
        }));
      formData.append("ingredients", JSON.stringify(ingredientsData));

      // Image upload is currently disabled.
      // if (form.images && form.images.length > 0) {
      //   form.images.forEach((file) => {
      //     formData.append("images", file);
      //   });
      // }

      await experimentApi.createExperiment(formData);

      toast.success("Experiment submitted successfully!");

      // Reset form or redirect
      setStep(1);
      setForm({
        recipeName: "",
        version: "v1.0",
        expDate: "",
        expTime: "",
        temp: "",
        timing: "",
        expTexture: "",
        expOutputValue: "",
        expOutputUnit: "g",
        actTexture: "",
        actOutputValue: "",
        actOutputUnit: "g",
        remarks: "",
        // images: [],
      });
      setIngredients([{ name: "", quantity: "", unit: "g" }]);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to submit experiment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Create Experiment"
        subtitle="Submit a new cooking experiment for quality review and AI analysis."
      />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-0">
        <StepIndicator current={step} />

        <Card className="rounded-[32px] shadow-2xl shadow-black/5 dark:shadow-none p-6 sm:p-10 border-[var(--border)]">
          <div className="space-y-6">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent-light)] shrink-0">
                    <ChefHat size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[var(--text)] tracking-tight text-glow-sm">
                      Recipe Information
                    </h2>
                    <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5 opacity-70">
                      Define the core details of your experiment
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Recipe Name */}
                  <div className="relative group">
                    <label className="block text-[11px] font-black text-[var(--muted)] uppercase tracking-widest mb-2 px-1">
                      Recipe Name{" "}
                      <span className="text-[var(--danger)]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.recipeName}
                        onChange={(e) => {
                          set("recipeName")(e);
                          setShowSuggestions(true);
                          setRecipeMode("create");
                          setVersionManual(false);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() =>
                          setTimeout(() => setShowSuggestions(false), 150)
                        }
                        placeholder="e.g. Butter Paneer"
                        className={`input-field w-full pl-4 pr-10 py-3.5 font-bold shadow-sm ${errors.recipeName ? "border-rose-500 bg-rose-500/5" : ""}`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary)] pointer-events-none group-focus-within:scale-110 transition-transform">
                        <Plus size={18} strokeWidth={3} />
                      </div>
                    </div>
                    {errors.recipeName && (
                      <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest">
                        {errors.recipeName}
                      </p>
                    )}
                    {showSuggestions &&
                      (suggestions.length > 0 ||
                        (!isExistingRecipeExact && form.recipeName.trim())) && (
                        <div className="absolute top-full left-0 right-0 mt-3 border border-[var(--border)] rounded-2xl bg-[var(--surface)] overflow-hidden shadow-2xl z-30 backdrop-blur-xl">
                          {suggestions.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectRecipe(name);
                              }}
                              className="w-full text-left p-4 border-none bg-transparent cursor-pointer text-sm font-bold text-[var(--text)] hover:bg-[var(--primary-glow)] transition-colors border-b last:border-b-0 border-[var(--border)]/30"
                            >
                              {name}
                            </button>
                          ))}
                          {!isExistingRecipeExact && form.recipeName.trim() && (
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleCreateRecipe();
                              }}
                              className="w-full text-left p-4 border-none bg-emerald-500/10 cursor-pointer text-sm font-black text-emerald-600 dark:text-emerald-400"
                            >
                              Create "{form.recipeName.trim()}"
                            </button>
                          )}
                        </div>
                      )}
                  </div>

                  {/* Version Bump */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-[var(--muted)] uppercase tracking-widest mb-2 px-1">
                      Version <span className="text-[var(--danger)]">*</span>
                    </label>
                    <div className="flex gap-3 border-[var(--border)]">
                      <input
                        type="text"
                        value={form.version}
                        className="input-field grow bg-[var(--bg)] font-black text-center tracking-wider text-[var(--accent-light)] border-none shadow-inner"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={handleChangeVersionMajor}
                        disabled={versionBumped}
                        className={`px-5 py-3 rounded-xl border-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all shrink-0 ${
                          versionBumped
                            ? "bg-[var(--border)] border-[var(--border)] text-[var(--muted)] cursor-not-allowed opacity-40"
                            : "bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent-light)] hover:shadow-lg active:scale-95"
                        }`}
                      >
                        Bump V
                      </button>
                    </div>
                  </div>

                  <DatePicker
                    label="Experiment Date"
                    value={form.expDate}
                    onChange={set("expDate")}
                    error={errors.expDate}
                  />
                  <TimePicker
                    label="Experiment Time"
                    value={form.expTime}
                    onChange={set("expTime")}
                    required
                    error={errors.expTime}
                  />
                </div>

                <div className="mt-12 pt-10 border-t border-[var(--border)] relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] px-6 py-1.5 rounded-full border border-[var(--border)] text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em]">
                    Ingredients Component
                  </div>

                  <div className="text-sm font-black text-[var(--text)] uppercase tracking-widest mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center">
                      <Plus size={16} strokeWidth={3} />
                    </div>
                    Composition List
                  </div>

                  <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_56px] gap-6 text-[10px] text-[var(--muted)] font-black uppercase tracking-[0.2em] mb-4 px-2">
                    <div>Ingredient Target</div>
                    <div>Quantity</div>
                    <div>Unit</div>
                    <div />
                  </div>

                  <div className="space-y-4">
                    {ingredients.map((ing, idx) => {
                      const isDuplicate = ingredients.filter(i => i.name.trim() && i.name.trim().toLowerCase() === ing.name.trim().toLowerCase()).length > 1;
                      return (
                        <div
                          key={`ingredient-${idx}`}
                          className={`flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_56px] gap-4 sm:gap-6 p-5 sm:p-5 sm:bg-transparent rounded-2xl border sm:border-none relative group transition-all ${isDuplicate ? "bg-rose-500/5 border-rose-500/50" : "bg-zinc-500/5"}`}
                        >
                        <div className="sm:hidden text-[10px] font-black text-[var(--accent-light)] uppercase tracking-widest mb-1 pb-1 border-b border-[var(--border)]">
                          Ingredient #{idx + 1}
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            value={ing.name}
                            onChange={(e) => {
                              updateIngredient(idx, { name: e.target.value });
                              setIngredientSuggest({
                                row: idx,
                                index: -1,
                                open: true,
                              });
                            }}
                            onFocus={() =>
                              setIngredientSuggest({
                                row: idx,
                                index: -1,
                                open: true,
                              })
                            }
                            onBlur={() =>
                              setTimeout(() => {
                                setIngredientSuggest({
                                  row: null,
                                  index: -1,
                                  open: false,
                                });
                                handleIngredientBlur(idx, ing.name);
                              }, 150)
                            }
                            onKeyDown={(e) => {
                              const suggestions =
                                ingredientSuggest.row === idx
                                  ? ingredientSuggestions
                                  : [];
                              if (
                                !ingredientSuggest.open ||
                                ingredientSuggest.row !== idx
                              )
                                return;
                              if (e.key === "ArrowDown") {
                                e.preventDefault();
                                setIngredientSuggest((s) => ({
                                  ...s,
                                  index: Math.min(
                                    s.index + 1,
                                    suggestions.length - 1,
                                  ),
                                }));
                              }
                              if (e.key === "ArrowUp") {
                                e.preventDefault();
                                setIngredientSuggest((s) => ({
                                  ...s,
                                  index: Math.max(s.index - 1, 0),
                                }));
                              }
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const pick =
                                  suggestions[ingredientSuggest.index];
                                if (pick) {
                                  handleIngredientSelect(idx, pick);
                                } else {
                                  handleIngredientCreate(idx, ing.name, {
                                    saveUnit: true,
                                  });
                                }
                              }
                              if (e.key === "Escape") {
                                setIngredientSuggest({
                                  row: null,
                                  index: -1,
                                  open: false,
                                });
                              }
                            }}
                            placeholder="Search or add ingredient"
                            className="input-field w-full px-4 py-3.5 font-bold"
                          />
                          {(() => {
                            const backendSuggestions =
                              ingredientSuggest.row === idx
                                ? ingredientSuggestions
                                : [];
                            const savedList = savedIngredients.map((item) => ({
                              name: item.name,
                              unit: item.unit,
                            }));
                            const customList = customIngredients.map(
                              (name) => ({
                                name,
                                unit: "",
                              }),
                            );
                            const allSuggestions = Array.from(
                              new Map(
                                [
                                  ...backendSuggestions,
                                  ...savedList,
                                  ...customList,
                                ].map((item) => [
                                  String(item.name || "")
                                    .trim()
                                    .toLowerCase(),
                                  item,
                                ]),
                              ).values(),
                            );
                            const typed = String(ing.name ?? "").trim();
                            const canCreate =
                              typed &&
                              !allSuggestions.some(
                                (item) =>
                                  item.name.toLowerCase() ===
                                  typed.toLowerCase(),
                              );
                            if (
                              !ingredientSuggest.open ||
                              ingredientSuggest.row !== idx ||
                              (!allSuggestions.length && !canCreate)
                            ) {
                              return null;
                            }
                            return (
                              <div className="absolute top-full left-0 right-0 mt-2 border border-[var(--border)] rounded-2xl bg-[var(--surface)] overflow-hidden shadow-2xl z-30 max-h-56 overflow-y-auto backdrop-blur-xl">
                                {allSuggestions.map((item, i) => (
                                  <button
                                    key={`${item.name}-${i}`}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() =>
                                      handleIngredientSelect(idx, item)
                                    }
                                    className={`w-full text-left p-4 border-none transition-colors cursor-pointer text-xs font-black text-[var(--text)] border-b last:border-b-0 border-[var(--border)]/30 ${
                                      i === ingredientSuggest.index
                                        ? "bg-[var(--accent-glow)] text-[var(--accent-light)]"
                                        : "bg-transparent opacity-80"
                                    } hover:bg-[var(--accent-glow)] hover:opacity-100`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span>{item.name}</span>
                                      {item.unit ? (
                                        <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-[0.18em]">
                                          {item.unit}
                                        </span>
                                      ) : null}
                                    </div>
                                  </button>
                                ))}
                                {canCreate && (
                                  <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() =>
                                      handleIngredientCreate(idx, ing.name, {
                                        saveUnit: true,
                                      })
                                    }
                                    className="w-full text-left p-4 border-none bg-emerald-500/5 cursor-pointer text-xs font-black text-emerald-600"
                                  >
                                    + CREATE "{typed.toUpperCase()}"
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:contents">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={ing.quantity}
                              onChange={(e) =>
                                updateIngredient(idx, {
                                  quantity: e.target.value,
                                })
                              }
                              placeholder="0.00"
                              className="input-field w-full px-4 py-3.5 font-black text-center sm:text-left"
                            />
                          </div>
                          <div className="relative">
                            <select
                              value={ing.unit}
                              onChange={async (e) => {
                                const newUnit = e.target.value;
                                updateIngredient(idx, { unit: newUnit });

                                // ✅ Bind API: Update unit in catalog if name is present
                                if (ing.name.trim()) {
                                  try {
                                    await experimentApi.addIngredient(
                                      ing.name.trim(),
                                      newUnit,
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Failed to update ingredient unit in catalog:",
                                      error,
                                    );
                                  }
                                }
                              }}
                              className="input-field w-full px-4 py-3.5 font-black appearance-none cursor-pointer"
                            >
                              {INGREDIENT_UNITS.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeIngredient(idx)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDuplicate ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"}`}
                          title={isDuplicate ? "Duplicate Ingredient Detected" : "Remove Row"}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    );
                  })}
                  </div>

                  <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                    {(() => {
                      const lastIng = ingredients[ingredients.length - 1];
                      const canAppend = lastIng && lastIng.name.trim() && lastIng.quantity;
                      return (
                        <button
                          type="button"
                          onClick={addIngredient}
                          disabled={!canAppend}
                          className={`w-full sm:w-auto p-4 px-8 rounded-2xl border-2 border-dashed transition-all shadow-sm flex items-center justify-center gap-3 group ${
                            canAppend
                              ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent-light)] hover:bg-[var(--accent)] hover:text-white active:scale-95"
                              : "border-[var(--border)] bg-[var(--bg)]/50 text-[var(--muted)] cursor-not-allowed opacity-50"
                            }`}
                        >
                          <Plus
                            size={20}
                            className={canAppend ? "group-hover:rotate-90 transition-transform" : ""}
                          />
                          Append Ingredient
                        </button>
                      );
                    })()}
                    {errors.ingredients && (
                      <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/5 px-4 py-2 rounded-lg border border-rose-500/20">
                        {errors.ingredients}
                      </div>
                    )}
                    <div className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest opacity-50 hidden sm:block">
                      Automatic Unit Sync Enabled
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent-light)] shrink-0">
                    <Thermometer size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[var(--text)] tracking-tight">
                      Cooking Parameters
                    </h2>
                    <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5 opacity-70">
                      Temperature and timing are immutable after submission
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Target Temperature (°C)"
                    value={form.temp}
                    onChange={set("temp")}
                    placeholder="e.g. 185"
                    type="number"
                    icon={<Thermometer size={16} />}
                    required
                    error={errors.temp}
                  />
                  <FormInput
                    label="Cooking Duration (mins)"
                    value={form.timing}
                    onChange={set("timing")}
                    placeholder="e.g. 45"
                    type="number"
                    icon={<Timer size={16} />}
                    required
                    error={errors.timing}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Locked on Submit",
                      desc: "Parameters cannot be modified once the experiment is logged.",
                      icon: <CheckCircle size={16} />,
                      color: "text-[var(--accent-light)]",
                      bg: "bg-[var(--accent-glow)]",
                    },
                    {
                      title: "Audit Logged",
                      desc: "Every parameter change is cryptographically recorded in the log.",
                      icon: <CheckCircle size={16} />,
                      color: "text-emerald-600",
                      bg: "bg-emerald-500/5",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className={`p-5 rounded-2xl border border-[var(--border)] ${item.bg} flex items-start gap-4 transition-transform hover:scale-[1.02]`}
                    >
                      <div className={`mt-1 ${item.color}`}>{item.icon}</div>
                      <div>
                        <div className="text-[11px] font-black text-[var(--text)] uppercase tracking-widest mb-1">
                          {item.title}
                        </div>
                        <div className="text-xs font-medium text-[var(--muted)] leading-relaxed">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <ChefHat size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[var(--text)] tracking-tight">
                      Output Data
                    </h2>
                    <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5 opacity-70">
                      Expected vs. actual cooking results
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Expected */}
                  <div className="space-y-6">
                    <div className="text-[11px] font-black text-[var(--primary)] uppercase tracking-[0.2em] border-b-2 border-[var(--primary)]/20 pb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                      Expected Result
                    </div>
                    <div className="space-y-5">
                      <FormInput
                        label="Expected Texture"
                        value={form.expTexture}
                        onChange={set("expTexture")}
                        placeholder="e.g. Smooth, Creamy"
                        error={errors.expTexture}
                      />
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-[var(--muted)] uppercase tracking-widest px-1">
                          Expected Output
                        </label>
                        <div className="grid grid-cols-[1fr_120px] gap-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={form.expOutputValue}
                            onChange={set("expOutputValue")}
                            placeholder="e.g. 2.5"
                            className={`input-field grow px-4 py-3 font-bold ${errors.expOutputValue ? "border-rose-500 bg-rose-500/5" : ""}`}
                          />
                          <select
                            value={form.expOutputUnit}
                            onChange={set("expOutputUnit")}
                            className="input-field px-4 py-3 font-bold bg-[var(--surface)]"
                          >
                            {OUTPUT_UNITS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.expOutputValue && (
                          <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest">
                            {errors.expOutputValue}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actual */}
                  <div className="space-y-6">
                    <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] border-b-2 border-emerald-500/20 pb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Actual Result
                    </div>
                    <div className="space-y-5">
                      <FormInput
                        label="Achieved Texture"
                        value={form.actTexture}
                        onChange={set("actTexture")}
                        placeholder="e.g. Slightly Grainy"
                        error={errors.actTexture}
                      />
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-[var(--muted)] uppercase tracking-widest px-1">
                          Actual Output
                        </label>
                        <div className="grid grid-cols-[1fr_120px] gap-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={form.actOutputValue}
                            onChange={set("actOutputValue")}
                            placeholder="e.g. 2.4"
                            className={`input-field grow px-4 py-3 font-bold ${errors.actOutputValue ? "border-rose-500 bg-rose-500/5" : ""}`}
                          />
                          <select
                            value={form.actOutputUnit}
                            onChange={set("actOutputUnit")}
                            className="input-field px-4 py-3 font-bold bg-[var(--bg)] opacity-50 cursor-not-allowed"
                            disabled
                          >
                            {OUTPUT_UNITS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.actOutputValue && (
                          <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest">
                            {errors.actOutputValue}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row items-start gap-4">
                  <div className="mt-1 text-amber-600">
                    <Timer size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="text-[11px] font-black text-amber-800 dark:text-amber-500 uppercase tracking-widest mb-1">
                        AI Variance Analysis Protocols
                      </div>
                      <p className="text-xs font-medium text-amber-700/80 dark:text-amber-500/80 leading-relaxed">
                        The AI engine will automatically compute metrics to determine the final quality score based on SR&ED tracking standards.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <div className="text-[10px] font-bold text-amber-800 dark:text-amber-500 uppercase tracking-widest mb-1">Yield Deviation Formula</div>
                        <div className="text-[11px] font-mono text-amber-900 dark:text-amber-400 bg-amber-500/10 p-1.5 rounded">
                          ((Actual - Expected) / Expected) × 100%
                        </div>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <div className="text-[10px] font-bold text-amber-800 dark:text-amber-500 uppercase tracking-widest mb-1">Texture Validation</div>
                        <div className="text-[11px] text-amber-900 dark:text-amber-400 leading-snug">
                          NLP Semantic Similarity matching between Expected and Actual texture vectors.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-[var(--muted)] uppercase tracking-widest px-1">
                    Chef Observations & Remarks
                  </label>
                  <textarea
                    value={form.remarks}
                    onChange={set("remarks")}
                    placeholder="Share any specific notes, deviations, or unexpected observations during the cooking process..."
                    className="input-field w-full min-h-[120px] resize-none p-4 text-sm font-medium"
                  />
                </div>
              </div>
            )}
            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                    <Plus size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[var(--text)] tracking-tight">
                      Final Review & Submit
                    </h2>
                    <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5 opacity-70">
                      Verify experiment details before submission
                    </p>
                  </div>
                </div>

                {/* Image upload is currently disabled.
                  <div className="grid grid-cols-1 gap-6">
                    <FileUploader
                      label="Supporting Images"
                      hint="Capture or upload images of final dish (max 3 files)"
                      accept="image/*"
                      maxFiles={3}
                      onFilesChange={(files) => {
                        setForm((f) => ({ ...f, images: files }));
                        if (errors.images) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.images;
                            return next;
                          });
                        }
                      }}
                    />
                    {errors.images && (
                      <p className="text-xs font-bold text-rose-500 mt-2 uppercase tracking-widest text-center">
                        {errors.images}
                      </p>
                    )}
                  </div>
                */}

                <div className="p-8 bg-[var(--bg)] rounded-[32px] border-2 border-dashed border-[var(--border)]">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--border)]">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--primary-glow)] flex items-center justify-center text-[var(--primary)] text-2xl shadow-inner">
                      <CheckCircle size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--primary)] uppercase font-black tracking-[0.2em] mb-1">
                        Ready for AI Audit
                      </div>
                      <div className="text-lg font-black text-[var(--text)] tracking-tight">
                        Experiment Summary
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      {
                        label: "Target Recipe",
                        val: `${form.recipeName} ${form.version}`,
                      },
                      {
                        label: "Batch Reference",
                        val: `EXP-${Date.now().toString().slice(-6)}`,
                      },
                      {
                        label: "Cook Profile",
                        val: `${form.temp}°C / ${form.timing} mins`,
                      },
                      {
                        label: "Data Integrity",
                        val: `${ingredients.length} Items Logged`,
                      },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1 min-w-0">
                        <div className="text-[10px] text-[var(--muted)] uppercase font-black tracking-widest opacity-60">
                          {item.label}
                        </div>
                        <div className="text-sm font-black text-[var(--text)] tracking-tight break-all">
                          {item.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-sm relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-24 h-full bg-emerald-500/5 -skew-x-12 translate-x-8 group-hover:translate-x-4 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Immutable Submission Guaranteed
                    </div>
                    <p className="text-xs font-bold text-[var(--muted)] leading-relaxed max-w-2xl">
                      Once submitted, this experiment is cryptographically
                      sealed. It{" "}
                      <span className="text-[var(--text)]">
                        cannot be modified or removed
                      </span>{" "}
                      from the Urban-Tadka history.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-8 border-t border-[var(--border)]">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className="px-8 py-3.5 rounded-xl text-sm font-black text-[var(--muted)] uppercase tracking-widest hover:text-[var(--text)] hover:bg-[var(--bg)] transition-all active:scale-95"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-4">
                {step < 4 ? (
                  <button
                    onClick={() => {
                      let stepErrors = {};
                      if (step === 1)
                        stepErrors = validateStep1(form, ingredients);
                      else if (step === 2) stepErrors = validateStep2(form);
                      else if (step === 3) stepErrors = validateStep3(form);

                      if (Object.keys(stepErrors).length > 0) {
                        setErrors(stepErrors);
                        toast.error("Please fix the errors before proceeding.");
                        return;
                      }

                      setErrors({});
                      setStep((s) => s + 1);
                    }}
                    className="btn-primary min-w-[160px] py-3.5 rounded-xl font-black italic tracking-tight text-sm active:scale-95"
                  >
                    PROCEED TO NEXT STEP
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitExperiment}
                    disabled={isSubmitting}
                    className={`btn-primary flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-black italic tracking-tight text-sm active:scale-95 group ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <ChefHat
                      size={18}
                      className={
                        isSubmitting
                          ? "animate-spin"
                          : "group-hover:rotate-12 transition-transform"
                      }
                    />
                    {isSubmitting ? "SUBMITTING..." : "SUBMIT FINAL EXPERIMENT"}
                  </button>
                )}
              </div>
            </div>

            {submitMessage && (
              <div className="mt-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs text-center animate-in fade-in slide-in-from-bottom-2">
                {submitMessage}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
