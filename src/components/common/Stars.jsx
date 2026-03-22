import React from "react";
import { Ic } from "./Icons";

export default function Stars({ rating = 0 }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? "star-filled" : "star-empty"}>
          <Ic.Star filled={i <= rating} />
        </span>
      ))}
    </span>
  );
}
