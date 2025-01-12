"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import getUserInfo from "@/components/getUserInfo";
import {} from "@/hooks/useBreedManagement";
import { toast } from "react-toastify";
import { GetCategory, Create } from "@/hooks/useInventory";
import { useForm } from "react-hook-form";
import NormalInput from "@/components/FormCompsV2/NormalInput";
import SelectInput from "@/components/FormCompsV2/SelectInput";
import { useQuery } from "react-query";
import TextArea from "@/components/FormCompsV2/TextArea";
import { QuarantinePig } from "@/hooks/useQuarantine";
import QrCode from "@/components/QrComponent/qrcode";
import Loading from "@/components/Loading/loading";

export default function Page() {
  const [allowed, setIsAllowed] = useState(false);
  const [pig_list, setPigList] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [hideScanner, setHideScanner] = useState(false);
  const [show, showModal] = useState(false);

  const {
    data: Batch,
    isLoading: BatchLoading,
    isError: BatchError,
    isFetching: BatchFetching,
  } = useQuery(
    "batch_list",
    async () => {
      const response = await fetch(`/api/get/Searchers/getBatch`);
      return response.json();
    },
    {}
  );
  console.log(Batch);
  const [showBatch, setShowBatch] = useState(false);
  const [showCage, setShowCage] = useState(false);
  const [showPig, setShowPig] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCage, setSelectedCage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitSuccessful, isSubmitting, isSubmitted },
  } = useForm({
    defaultValues: {
      pig_id: "",
      activity: "",
      item_id: "",
      item_name: "",
      operation_date: "",
      schedule_option: "1",
    },
    criteriaMode: "all",
    mode: "all",
  });
  const {
    isLoading: isLoading2,
    isError,
    data: data2,
    error: error2,
    refetch: refetch2,
  } = useQuery(
    "pig_list",
    async () => {
      const response = await fetch(
        `/api/post/Schedule/Pigs/getPigs?keyword=${
          keyword == "" ? "" : keyword
        }`
      );
      return response.json();
    },
    {}
  );
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
    reset: reset2,
  } = useForm({
    defaultValues: {
      pig_id: "",
      remarks: "",
      cage_id: "",
    },
    mode: "onChange",
    criteriaMode: "all",
  });

  useEffect(() => {
    if (data2) {
      if (data2.code === 200) {
        if (data2.data) {
          setPigList(
            data2.data.map((item: any) => ({
              value: item.pig_id,
              display: item.pig_id,
              cage_name: item.cage_name,
              batch_name: item.batch_name,
              disabled: false,
            }))
          );
        }
      } else {
        setPigList([]);
      }
    }
  }, [data2]);

  useEffect(() => {
    if (keyword == "") {
      refetch2();
    }
  }, [keyword]);

  const [item_id, setItemId] = useState("");
  const [item_name, setItemName] = useState("");
  const [category_id, setCategoryId] = useState("default");
  const [item_description, setItemDescription] = useState("");
  const [item_quantity, setItemQuantity] = useState("");
  const [item_unit, setItemUnit] = useState("default");
  const [item_net_weight, setItemNetWeight] = useState("");

  const [isItemName, setIsItemName] = useState(true);
  const [isCategoryId, setIsCategoryId] = useState(true);
  const [isItemDescription, setIsItemDescription] = useState(true);
  const [isItemQuantity, setIsItemQuantity] = useState(true);
  const [isItemUnit, setIsItemUnit] = useState(true);
  const [category_list, setCategoryList] = useState([]);
  const [isItemNetWeight, setIsItemNetWeight] = useState(true);
  const [cage_list, setCageList] = useState<
    {
      value: string;
      display: string;
      disabled: boolean;
    }[]
  >([]);

  const [processing, setProcessing] = useState(false);

  const router = useRouter();
  const loading = getUserInfo();
  let list: any = [];
  useEffect(() => {
    async function checkUser() {
      if (!loading.loading) {
        if (loading.data.job == "owner" || loading.data.job == "veterinarian") {
          open("/?error=404", "_self");
          return false;
        }
        setIsAllowed(true);
      }
    }
    checkUser();
  }, [loading]);

  function resetState() {
    reset();
  }

  const {
    data: Cage,
    isLoading: CageLoading,
    isError: CageError,
    isFetching: CageFetching,
    refetch: CageRefetch,
  } = useQuery(
    "cage_list",
    async () => {
      const response = await fetch(
        `/api/get/Searchers/getCage?batch_id=${selectedBatch}`
      );
      return response.json();
    },
    {}
  );

  useEffect(() => {
    if (selectedBatch != "") {
      CageRefetch();
    }
  }, [selectedBatch]);

  useEffect(() => {
    async function exec_get() {
      const returned = await GetCategory();
      console.log(returned);
      if (returned.code == 200) {
        if (returned.data.length !== 0) {
          returned.data.map((data: any, key: number) => {
            list.push({
              value: data.category_id,
              display: data.category_name,
              disabled: false,
            });
          });
          setCategoryList(list);
        }
      }
    }
    exec_get();
  }, []);

  const onSubmit = async (data: any) => {
    if (!confirm("Are you sure you want to create?")) {
      setProcessing(false);
      return false;
    } else {
      setProcessing(true);
      const returned = await QuarantinePig(
        data.cage_id,
        data.pig_id,
        data.remarks
      );
      if (returned.code == 200) {
        setProcessing(false);
        toast.success(returned.message);
        resetState();
        refetch2();
      } else {
        setProcessing(false);
        toast.error(returned.message);
      }
    }
  };
  const { isLoading, isFetching, data, refetch, error } = useQuery(
    "userData",
    async () => {
      const response = await fetch(
        `${location.origin}/api/post/CageManagement/getAllQuarantineCage`
      );
      const data = await response.json();
      return data;
    },
    {
      refetchOnWindowFocus: false,
    }
  );
  console.log(Cage);
  useEffect(() => {
    if (data) {
      if (data.code == 200) {
        data.data.map((data: any, key: number) => {
          setCageList((prev) => {
            return [
              ...prev,
              {
                value: data.cage_id,
                display: data.cage_name,
                disabled: false,
              },
            ];
          });
        });
      }
    }
  }, [data]);
  const {
    data: Pig,
    isLoading: PigLoading,
    isError: PigError,
    isFetching: PigFetching,
    refetch: PigRefetch,
  } = useQuery(
    "pig_list",
    async () => {
      const response = await fetch(
        `${location.origin}/api/get/Searchers/getPig?cage_id=${selectedCage}&batch_id=${selectedBatch}`
      );
      const data = await response.json();
      return data;
    },
    {}
  );
  useEffect(() => {
    if (selectedCage != "") {
      PigRefetch();
    }
  }, [selectedCage]);

  if (loading.loading) {
    return loading.loader;
  } else if (!allowed) {
    return loading.loader;
  } else {
    return (
      <>
        <input
          type="checkbox"
          id="my-modal-6"
          checked={hideScanner}
          onChange={() => {
            setHideScanner(!hideScanner);
          }}
          className="modal-toggle"
        />
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-base-content">
              Use custom Qr Code
            </h3>
            <QrCode
              setter={setValue}
              setHide={setHideScanner}
              hide={hideScanner}
              ActionMaker={"pig_id"}
            ></QrCode>
            <div className="modal-action">
              <button
                onClick={() => {
                  setHideScanner(false);
                }}
                className="btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        <input type="checkbox" checked={showCage} className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box w-3/4">
            <label
              onClick={() => {
                setShowCage(false);
              }}
              className="btn btn-sm btn-circle absolute right-2 top-2"
            >
              ✕
            </label>
            <h3 className="font-bold text-lg">
              Find the cage that the pig is enclosed.
            </h3>
            <div className="form-control">
              <label className="label overflow-y-auto">
                <table className="table table-compact w-full label-text-alt">
                  <thead>
                    <tr>
                      <th>Batch Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CageFetching ? (
                      <Loading></Loading>
                    ) : Cage.data.length == 0 ? (
                      <tr className="text-center">
                        <td colSpan={4}>
                          No cage available that can be selected
                        </td>
                      </tr>
                    ) : (
                      Cage.data.map((item: any, index: any) => (
                        <tr key={index}>
                          <td>
                            {" "}
                            <label
                              onClick={() => {
                                setShowCage(false);
                                setSelectedCage(item.cage_id);
                                setShowPig(true);
                              }}
                              className="link underline hover:text-primary"
                            >
                              {item.cage_name}
                            </label>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </label>
            </div>
          </div>
        </div>
        <input type="checkbox" checked={showBatch} className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box w-3/4">
            <label
              onClick={() => {
                setShowBatch(false);
              }}
              className="btn btn-sm btn-circle absolute right-2 top-2"
            >
              ✕
            </label>
            <h3 className="font-bold text-lg">
              Find the batch that the pig is belonged
            </h3>
            <div className="form-control">
              <label className="label overflow-y-auto">
                <table className="table table-compact w-full label-text-alt">
                  <thead>
                    <tr>
                      <th>Batch Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BatchFetching ? (
                      <Loading></Loading>
                    ) : Batch.data.length == 0 ? (
                      <tr className="text-center">
                        <td colSpan={4}>
                          No batch available that can be quarantined
                        </td>
                      </tr>
                    ) : (
                      Batch.data.map((item: any, index: any) => (
                        <tr key={index}>
                          <td>
                            {" "}
                            <label
                              onClick={() => {
                                setShowBatch(false);
                                setSelectedBatch(item.batch_id);
                                setShowCage(true);
                              }}
                              className="link underline hover:text-primary"
                            >
                              {item.batch_name}{" "}
                            </label>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </label>
            </div>
          </div>
        </div>
        <input type="checkbox" checked={showPig} className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box w-3/4">
            <label
              onClick={() => {
                setShowPig(false);
              }}
              className="btn btn-sm btn-circle absolute right-2 top-2"
            >
              ✕
            </label>
            <h3 className="font-bold text-lg">
              Search the pig you want to quarantine
            </h3>
            <div className="form-control">
              <label className="label overflow-y-auto">
                <table className="table table-compact w-full label-text-alt">
                  <thead>
                    <tr>
                      <th>Pig Id</th>
                      <th>Batch</th>
                      <th>Cage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PigFetching ? (
                      <Loading></Loading>
                    ) : Pig.length == 0 ? (
                      <tr className="text-center">
                        <td colSpan={4}>
                          No pig available that can be quarantined
                        </td>
                      </tr>
                    ) : (
                      Pig.data.map((item: any, index: any) => (
                        <tr key={index}>
                          <td>
                            {" "}
                            <label
                              onClick={() => {
                                setValue("pig_id", item.pig_id, {
                                  shouldValidate: true,
                                });
                                setShowPig(false);
                              }}
                              htmlFor="search_pig"
                              className="link underline hover:text-primary"
                            >
                              {item.pig_id}
                            </label>
                          </td>
                          <td>
                            {" "}
                            <label
                              onClick={() => {
                                setValue("pig_id", item.pig_id, {
                                  shouldValidate: true,
                                });
                                setShowPig(false);
                              }}
                              htmlFor="search_pig"
                              className="link underline hover:text-primary"
                            >
                              {item.batch_name}
                            </label>
                          </td>
                          <td>
                            {" "}
                            <label
                              onClick={() => {
                                setValue("pig_id", item.pig_id, {
                                  shouldValidate: true,
                                });
                                setShowPig(false);
                              }}
                              htmlFor="search_pig"
                              className="link underline hover:text-primary"
                            >
                              {item.cage_name}{" "}
                            </label>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </label>
            </div>
          </div>
        </div>
        <div className="w-full h-full oveflow-y-scroll flex flex-col overflow-x-hidden">
          <div className=" h-auto w-full">
            <div className="w-11/12  mx-auto flex flex-row">
              <p className="text-2xl text-base-content my-auto p-4">
                Manage Quarantine
              </p>
            </div>

            <div className=" w-11/12 mx-auto  text-base-content">
              <div className="">
                <div className="text-sm mt-2 ml-2  overflow-hidden breadcrumbs">
                  <ul className="card-title">
                    <li>Manage Quarantine</li>
                    <li className="font-bold">Quarantine Pig</li>
                  </ul>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  method="post"
                  className="flex w-full h-auto py-2 flex-col"
                >
                  <div className="w-full ml-2 grid lg:grid-cols-2 lg:grid-rows-none gap-2 grid-cols-none grid-rows-1">
                    <div>
                      <label
                        onClick={() => {
                          setShowBatch(true);
                        }}
                        className={`btn my-auto mx-4`}
                      >
                        Choose Pig
                      </label>
                      <button
                        type="button"
                        className={" mt-2 text-primary-content btn"}
                        onClick={() => {
                          setHideScanner(true);
                        }}
                      >
                        Scan QR CODE
                      </button>
                      <div className="divider ">OR</div>
                      <NormalInput
                        name="pig_id"
                        label="Pig ID"
                        register={register}
                        required={true}
                        errors={errors}
                        type="text"
                        validationSchema={{
                          required: "Pig ID is required",
                        }}
                      />
                    </div>
                    <SelectInput
                      name="cage_id"
                      label="Cage"
                      register={register}
                      required={true}
                      errors={errors}
                      type="text"
                      validationSchema={{ required: "Cage ID is required" }}
                      options={cage_list}
                    />
                  </div>

                  <div className="w-full ml-2 grid lg:grid-cols-1 gap-2 lg:grid-rows-none grid-cols-none grid-rows-1">
                    <TextArea
                      name="remarks"
                      label="Remarks"
                      register={register}
                      errors={errors}
                      validationSchema={{
                        required: "Remarks is required",
                        maxLength: {
                          value: 250,
                          message: "Remarks must not exceed 100 characters",
                        },
                        minLength: {
                          value: 10,
                          message:
                            "Remarks must not be less than 10 characters",
                        },
                      }}
                      required={true}
                    />
                  </div>
                  <div className="card-actions justify-end mt-6">
                    <button
                      className={`btn btn-active btn-success mx-4 ${
                        processing ? "loading" : ""
                      }`}
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        router.back();
                      }}
                      className="btn mx-4"
                    >
                      Back
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
