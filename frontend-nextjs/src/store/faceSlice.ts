// store/faceSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// --------------------
// Types
// --------------------
export interface FaceVerifyPayload {
  imageBase64: string;
}

export interface FaceEnrollPayload {
  id: string;
  imageBase64: string;
}

export interface FaceVerifyResponse {
  matched: boolean;
  score: number;
  employeeId?: string;
}

export interface FaceEnrollResponse {
  success: boolean;
  employeeId: string;
}

export type FaceStatus =
  | "idle"
  | "verifying"
  | "enrolling"
  | "done"
  | "enrolled"
  | "error";

export interface FaceState {
  status: FaceStatus;
  result: FaceVerifyResponse | FaceEnrollResponse | null;
  error: string | null;
}

// --------------------
// Async thunks
// --------------------
export const verifyFace = createAsyncThunk<
  FaceVerifyResponse, // return type
  FaceVerifyPayload, // payload type
  { rejectValue: string } // error type
>("face/verify", async (payload, thunkAPI) => {
  try {
    const res = await fetch("/ml/verify-face", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return (await res.json()) as FaceVerifyResponse;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const enrollFace = createAsyncThunk<
  FaceEnrollResponse,
  FaceEnrollPayload,
  { rejectValue: string }
>("face/enroll", async (payload, thunkAPI) => {
  try {
    const res = await fetch("/ml/enroll-face", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return (await res.json()) as FaceEnrollResponse;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// --------------------
// Slice
// --------------------
const initialState: FaceState = {
  status: "idle",
  result: null,
  error: null,
};

const faceSlice = createSlice({
  name: "face",
  initialState,
  reducers: {
    resetResult: (state) => {
      state.status = "idle";
      state.result = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // verifyFace
      .addCase(verifyFace.pending, (state) => {
        state.status = "verifying";
        state.error = null;
      })
      .addCase(
        verifyFace.fulfilled,
        (state, action: PayloadAction<FaceVerifyResponse>) => {
          state.status = "done";
          state.result = action.payload;
        }
      )
      .addCase(verifyFace.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload || action.error.message || "Unknown error";
      })

      // enrollFace
      .addCase(enrollFace.pending, (state) => {
        state.status = "enrolling";
        state.error = null;
      })
      .addCase(
        enrollFace.fulfilled,
        (state, action: PayloadAction<FaceEnrollResponse>) => {
          state.status = "enrolled";
          state.result = action.payload;
        }
      )
      .addCase(enrollFace.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload || action.error.message || "Unknown error";
      });
  },
});

export const { resetResult } = faceSlice.actions;
export default faceSlice.reducer;
