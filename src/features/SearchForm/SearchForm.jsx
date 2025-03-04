import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';
import { searchGroupedOptions } from '../../data/formData';
import ErrorMessage from '../../components/Form/ErrorMessage';
import Button from '../../components/Button';
import { SearchbarForm } from '../../components/Form/StyledForm';
import { IoSearchSharp } from 'react-icons/io5';
import useHospitalsQuery from '../../api/useGetHospitals';
import { useNavigate } from 'react-router-dom';
import { symptomsList } from '../../data/formData';

const formatGroupLabel = (data) => <span>{data.label}</span>;

const SearchForm = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const [searchRequestBody, setSearchRequestBody] = useState();

  const { isSuccess } = useHospitalsQuery(searchRequestBody);

  const onSubmit = async (data) => {
    console.log({ data });
    const submittedFilters = Object.entries(data).reduce((res, curr) => {
      const [key, value] = curr;
      if (Array.isArray(value)) {
        res[key] = value.map((value) => value.value);
      } else {
        res[key] = value.value || value;
      }
      return res;
    }, {});

    let prompt = [];
    submittedFilters.symptoms.forEach((symptom) => {
      const nonExistingSymptom = !symptomsList.includes(
        (value) => value.value === symptom,
      );
      if (nonExistingSymptom) {
        prompt.push(symptom);
      }
    });

    if (prompt.length > 0) {
      const finalPrompt = prompt.length > 1 ? prompt.join(', and ') : prompt[0];
      submittedFilters.prompt = finalPrompt;
    }
    setSearchRequestBody(submittedFilters);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const sendDataToMapResultsPage = () => {
      navigate('/results', { state: searchRequestBody });
    };
    if (isSuccess && searchRequestBody) {
      sendDataToMapResultsPage();
    }
  }, [navigate, isSuccess, searchRequestBody]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SearchbarForm>
        <Controller
          name="symptoms"
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange } }) => (
            <CreatableSelect
              classNamePrefix="search-filter"
              placeholder="Search by symptoms or speacialties"
              options={searchGroupedOptions}
              isMulti={true}
              onChange={onChange}
              formatGroupLabel={formatGroupLabel}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  borderStyle: 'none',
                  minWidth: '400px',
                  marginTop: 0,
                }),
              }}
              components={{
                IndicatorSeparator: () => null,
              }}
            />
          )}
        />
        <div className="bar"></div>
        <Controller
          defaultValue={false}
          name="englishSpeaking"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="checkbox-wrap">
              <label>English Available: </label>
              <input
                type="checkbox"
                onChange={(e) => {
                  onChange(e.target.checked);
                }}
                checked={value}
              />
            </div>
          )}
        />
        <Button type="submit" className="search-icon-btn">
          <IoSearchSharp className="search-icon" />
        </Button>
      </SearchbarForm>
      {errors.symptoms && (
        <ErrorMessage>
          Please select at least one symptom or specialty to search
        </ErrorMessage>
      )}
    </form>
  );
};

export default SearchForm;
