import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import "./style/inscription.css"

const Inscription = () => {
  const schema = Yup.object().shape({
    email: Yup.string().email("email non valide").required(),
    password: Yup.string().required(),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const onSubmitHandler = (data) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password }),
    };
    fetch("http://localhost:3001/account", requestOptions)
      .then((response) => response.json())
      .catch((e) => console.log(e));
    reset();
  };
  return (
    <div className="Inscription ">
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <h2>Lets sign you up.</h2>
        <br />

        <input
          {...register("email")}
          placeholder="email"
          type="email"
          required
        />
        <br />

        <input
          {...register("password")}
          placeholder="password"
          type="password"
          required
        />
        <br />

        <button type="submit">Sign up</button>
      </form>
    </div>
  );
};

export default Inscription;
