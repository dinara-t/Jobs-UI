import {
  Brand,
  BrandIcon,
  BrandText,
  BrandEyebrow,
  BrandTitle,
  BrandAccent,
} from "./Logo.styles";

const Logo = () => {
  return (
    <Brand>
      <BrandIcon>JA</BrandIcon>

      <BrandText>
        <BrandEyebrow>Workforce</BrandEyebrow>
        <BrandTitle>
          Job <BrandAccent>Assignment</BrandAccent>
        </BrandTitle>
      </BrandText>
    </Brand>
  );
};

export default Logo;