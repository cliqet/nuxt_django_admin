import type { ModelFieldType } from "~/shared/types/app";

export type FieldValueValidityType = {
  isValid: boolean;
  message: string;
};

type FileTypes = "Any" | string[];
type MaxSize = number | null;

export const useModelFormValidation = () => {
  const convertBytesToMb = (byteSize: number) => {
    return byteSize / (1024 * 1024);
  };

  const getFileExtension = (file: File): string => {
    // Use .name and split by the last dot
    const filename = file.name;
    const lastDotIndex = filename.lastIndexOf(".");

    // If no dot exists (index is -1), return an empty string
    return lastDotIndex !== -1
      ? filename.slice(lastDotIndex).toLowerCase()
      : "";
  };

  /**
   * Extracts file restrictions from a help text string.
   * Format: "Allowed file types: [Any] | Max file size in MB: [None]"
   */
  const extractFileRestrictions = (helpText: string): [FileTypes, MaxSize] => {
    // Matches everything inside square brackets [...]
    const matches = helpText.match(/\[(.*?)\]/g);

    if (!matches || matches.length < 2) {
      return ["Any", null];
    }

    if (matches[0] && matches[1]) {
      // 1. Process File Types
      const typeContent = matches[0].replace(/[[\]]/g, "");
      let fileTypes: FileTypes = "Any";

      if (typeContent !== "Any") {
        // Convert "'.jpg', '.png'" string into a real array
        fileTypes = typeContent
          .split(",")
          .map((t) => t.trim().replace(/['"]/g, ""));
      }

      // 2. Process File Size
      const sizeContent = matches[1].replace(/[[\]]/g, ""); // Remove brackets
      const maxSize: MaxSize =
        sizeContent === "None" ? null : Number(sizeContent);

      return [fileTypes, maxSize];
    }

    return ["Any", null];
  };

  const isFieldValueValid = (
    modelField: ModelFieldType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ): FieldValueValidityType => {
    const label = modelField.label;

    // 1. Handle Null/Undefined/Empty for Required Fields
    const isEmpty = value === null || value === undefined || value === "";
    if (modelField.required && isEmpty) {
      return { isValid: false, message: `${label} is required` };
    }

    // If not required and empty, it's valid regardless of type
    if (isEmpty) return { isValid: true, message: "" };

    // 2. Type-Specific Validation
    switch (modelField.type) {
      // --- String Based Fields ---
      case "CharField":
      case "SlugField":
      case "TextField":
      case "EmailField":
        if (typeof value !== "string")
          return { isValid: false, message: `${label} must be text` };

        if (modelField.max_length && value.length > modelField.max_length) {
          return {
            isValid: false,
            message: `${label} cannot exceed ${modelField.max_length} characters`,
          };
        }

        if (modelField.type === "EmailField") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value))
            return { isValid: false, message: "Invalid email format" };
        }

        if (modelField.regex_pattern) {
          const re = new RegExp(modelField.regex_pattern);
          if (!re.test(value))
            return { isValid: false, message: `${label} format is invalid` };
        }

        if (modelField.type === "SlugField") {
          const slugRegex = /^[-a-zA-Z0-9_]+$/;
          if (!slugRegex.test(value)) {
            return {
              isValid: false,
              message:
                "Enter a valid 'slug' consisting of letters, numbers, underscores or hyphens.",
            };
          }
        }

        break;

      case "HTMLField": {
        // Remove all HTML tags: <p></p>, <br>, etc.
        // Also remove &nbsp; and whitespace
        const plainText = value
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, "")
          .trim();

        // Check if it's empty after stripping tags
        if (modelField.required && plainText === "") {
          return { isValid: false, message: `${modelField.label} is required` };
        }
        break;
      }

      // --- Number Based Fields ---
      case "IntegerField":
      case "PositiveIntegerField":
      case "PositiveSmallIntegerField":
      case "DecimalField": {
        const num = Number(value);
        if (isNaN(num))
          return { isValid: false, message: `${label} must be a number` };

        if (modelField.type.includes("Positive") && num < 0) {
          return { isValid: false, message: `${label} must be positive` };
        }

        if (modelField.min_value !== undefined && num < modelField.min_value) {
          return {
            isValid: false,
            message: `${label} must be at least ${modelField.min_value}`,
          };
        }

        if (modelField.max_value !== undefined && num > modelField.max_value) {
          return {
            isValid: false,
            message: `${label} cannot exceed ${modelField.max_value}`,
          };
        }
        break;
      }

      // --- JSON Validation ---
      case "JSONField":
        if (typeof value === "string") {
          try {
            JSON.parse(value);
          } catch {
            return { isValid: false, message: `Invalid JSON format` };
          }
        }
        break;

      // --- Relational / List Fields ---
      case "ManyToManyField":
        if (
          !Array.isArray(value) ||
          (modelField.required && value.length === 0)
        ) {
          return {
            isValid: false,
            message: `Please select at least one ${label}`,
          };
        }
        break;

      case "ForeignKey":
      case "OneToOneField":
        if (!value)
          return { isValid: false, message: `Please select a ${label}` };
        break;

      // --- Date/Time (Basic check) ---
      // case "DateField":
      // case "DateTimeField":
      case "TimeField": {
        // <--- Add opening brace
        // 1. Check basic format HH:MM:SS
        const timeRegex = /^(\d{2}):(\d{2}):(\d{2})$/;
        const match = value.match(timeRegex);

        if (!match) {
          return { isValid: false, message: "Format must be HH:MM:SS" };
        }

        // 2. Extract and check ranges
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);

        if (hours > 23)
          return { isValid: false, message: "Hours must be 0-23" };
        if (minutes > 59)
          return { isValid: false, message: "Minutes must be 0-59" };
        if (seconds > 59)
          return { isValid: false, message: "Seconds must be 0-59" };

        break;
      }

      case "FileField":
      case "ImageField": {
        if (value) {
          const helpText = modelField.help_text;
          const [fileTypes, maxSize] = extractFileRestrictions(helpText);

          if (fileTypes !== "Any") {
            const fileExtension = getFileExtension(value);

            if (!fileTypes.includes(fileExtension)) {
              return {
                isValid: false,
                message: `${fileExtension} is not allowed`,
              };
            }
          }

          if (maxSize && convertBytesToMb(value.size) > maxSize) {
            return { isValid: false, message: `File exceeds ${maxSize} MB` };
          }
        }

        break;
      }
    }

    return { isValid: true, message: "" };
  };

  const convertModelFieldValuesToFormData = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: Record<string, any>,
    modelFields: Record<string, ModelFieldType>
  ): FormData => {
    const formData = new FormData();

    Object.keys(values).forEach((key) => {
      const value = values[key];
      const fieldType = modelFields[key]?.type;

      if (fieldType === "ImageField" || fieldType === "FileField") {
        // BE: If value == '', it skips processing (not required)
        // Otherwise, it looks in request.FILES[key]
        if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, "");
        }
      } else if (fieldType === "BooleanField") {
        // BE: boolean_values expects lowercase 'true' or 'false'
        formData.append(key, value ? "true" : "false");
      } else if (fieldType === "ManyToManyField" && Array.isArray(value)) {
        // BE: many_to_many_data[key] = value.split(',')
        // So we must send a comma-separated string
        formData.append(key, value.join(","));
      } else {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }
    });

    return formData;
  };

  return {
    isFieldValueValid,
    extractFileRestrictions,
    convertBytesToMb,
    convertModelFieldValuesToFormData,
  };
};
