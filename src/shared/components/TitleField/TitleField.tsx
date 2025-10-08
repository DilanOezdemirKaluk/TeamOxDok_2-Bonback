import Title, { TitleProps } from "antd/es/typography/Title";

interface TitleFieldProps {
  text: string;
  level?: TitleProps["level"];
  isBold?: boolean;
  fontSize?: number;
}

const defaultLevel: TitleProps["level"] = 5;

export const TitleField: React.FC<TitleFieldProps> = ({
  text,
  level = defaultLevel,
  isBold = true,
  fontSize = 13,
}) => {
  const effectiveFontSize = isBold && !fontSize ? 12 : fontSize;

  return (
    <>
      <Title
        level={level}
        style={{
          margin: 0,
          fontSize: `${effectiveFontSize}pt`,
          fontFamily: "Calibri, Arial, Verdana",
          fontWeight: isBold ? "bold" : "normal",
        }}
      >
        {text}
      </Title>
    </>
  );
};
