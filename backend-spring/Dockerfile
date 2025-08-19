# =============================
# Stage 1: Build Spring Boot app
# =============================
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# copy pom.xml and download deps (cached if unchanged)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# copy source code
COPY src ./src

# build jar
RUN mvn clean package -DskipTests

# =============================
# Stage 2: Run the app
# =============================
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
