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
  imageKey?: keyof T;
  rules?: any;
  avatarSize?: number;
  sx?: object; // para estilos del Autocomplete completo
  value?:any
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
  rules,
  sx,
  avatarSize = 24,
  value,
}: FormAutocompleteProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={value}
      rules={rules}
      render={({ field }) => {
        const selectedOption =
          options.find((o) => getOptionValue(o) === field.value) || null;

        return (
          <Autocomplete
            sx={{ width: 200, ...sx }} // ancho por defecto 200, sobreescribible
            options={options}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={(option, value) =>
              getOptionValue(option) === getOptionValue(value)
            }
            value={selectedOption}
            onChange={(_, value) =>
              field.onChange(value ? getOptionValue(value) : "")
            }
            renderOption={(props, option) => {
              const { key, ...restProps } = props;
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
                      sx={{ width: avatarSize, height: avatarSize }}
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
                        sx={{ width: avatarSize, height: avatarSize, mr: 1 }}
                      />
                    ) : (
                      params.InputProps.startAdornment
                    ),
                }}
              />
            )}
          />
        );
      }}
    />
  );
}
