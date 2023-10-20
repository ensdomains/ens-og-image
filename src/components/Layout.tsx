import { ReactElement } from "react";

type Props = {
  imageElement: ReactElement;
  title: string;
  subtitle?: string | null;
  type: "address" | "name";
};

export const Layout = ({ imageElement, title, subtitle, type }: Props) => {
  return (
    <div
      style={{
        gap: "48px",
        paddingLeft: "100px",
        paddingRight: "129px",
        width: "1200px",
        height: "630px",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        background:
          "linear-gradient(331deg, #4CB6F2 14.47%, #7298F8 59.89%, #8598FB 96.38%)",
      }}
    >
      {imageElement}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            display: "block",
            margin: 0,
            color: "#FFF",
            fontFamily: "Satoshi",
            fontSize: type === "name" ? "90px" : "76px",
            fontStyle: "normal",
            fontWeight: 830,
            lineHeight: "93%",
            maxWidth: "630px",
            whiteSpace: "no-wrap" as any,
            textOverflow: "ellipsis",
            wordBreak: "break-word",
            lineClamp: '3 "...  "',
          }}
        >
          {type === "name" ? title.replace(/\./g, ".\u200B") : title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: 0,
              color: "rgba(255, 255, 255, 0.65)",
              fontFamily: "Satoshi",
              fontSize: "40px",
              fontStyle: "normal",
              fontWeight: 700,
              lineHeight: "75%",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
