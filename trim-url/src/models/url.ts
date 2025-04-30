import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    trimId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    redirectUrl: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    history: [
      {
        timestamp: {
          type: Number,
          default: () => Date.now(),
        },
      },
    ],
  },
  {
    timestamps: true, 
  }
);

const Url = mongoose.model("trimUrl", urlSchema);
export default Url;
