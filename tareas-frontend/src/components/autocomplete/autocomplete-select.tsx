import { Autocomplete, Avatar, Box, TextField } from "@mui/material";
import { Controller, type Control, type FieldErrors } from "react-hook-form";

interface FormAutocompleteProps<T> {
  name: string;
  label: string;
  control: Control<any>;
  errors: FieldErrors;
  options: T[];
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
  imageKey?: keyof T; // campo opcional para mostrar imagen
  rules?: any;
}

export function FormAutocomplete<T>({
  name,
  label,
  control,
  errors,
  options,
  getOptionLabel,
  getOptionValue,
  imageKey,
  rules
}: FormAutocompleteProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => {
        const selectedOption = options.find(o => getOptionValue(o) === field.value) || null;

        return (
          <Autocomplete
            options={options}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={(option, value) =>
              getOptionValue(option) === getOptionValue(value)
            }
            value={selectedOption}
            onChange={(_, value) => field.onChange(value ? getOptionValue(value) : "")}
            renderOption={(props, option) => {
              const { key, ...restProps } = props; // separa key para evitar warning
              return (
                <Box
                  key={key}
                  component="li"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  {...restProps}
                >
                  {imageKey && option[imageKey] && (
                    <Avatar
                      src={String(option[imageKey])}
                      alt={getOptionLabel(option)}
                      sx={{ width: 24, height: 24 }}
                    />
                  )}
                  {getOptionLabel(option)}
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                margin="normal"
                fullWidth
                error={!!errors[name]}
                helperText={errors[name]?.message as string}
                InputProps={{
                  ...params.InputProps,
                  startAdornment:
                    selectedOption && imageKey && selectedOption[imageKey] ? (
                      <Avatar
                        src={String(selectedOption[imageKey])}
                        alt={getOptionLabel(selectedOption)}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      />
                    ) : params.InputProps.startAdornment,
                }}
              />
            )}
          />
        );
      }}
    />
  );
}
